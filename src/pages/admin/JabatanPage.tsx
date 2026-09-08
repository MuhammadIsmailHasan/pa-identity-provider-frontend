import { useState } from 'react';
import { Card, Tree, Button, Modal, Form, Input, TreeSelect, Space, Typography, Descriptions, message, Spin, Empty, Flex } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined, ApartmentOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { useJabatanTree, useCreateJabatan, useUpdateJabatan, useMoveJabatan, useDeleteJabatan } from '../../hooks/useJabatan';
import type { JabatanTreeNode } from '../../types/jabatan';
import type { DataNode } from 'antd/es/tree';

const { Text } = Typography;

export default function JabatanPage() {
  const { data: treeData, isLoading } = useJabatanTree();
  const createMutation = useCreateJabatan();
  const updateMutation = useUpdateJabatan();
  const moveMutation = useMoveJabatan();
  const deleteMutation = useDeleteJabatan();

  const [selectedNode, setSelectedNode] = useState<JabatanTreeNode | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [moveForm] = Form.useForm();

  const tree = treeData || [];

  const toAntTreeData = (nodes: JabatanTreeNode[]): DataNode[] => {
    return nodes.map((node) => ({
      key: node.id,
      title: node.name,
      children: node.children ? toAntTreeData(node.children) : [],
    }));
  };

  const toSelectData = (nodes: JabatanTreeNode[], excludeId?: number): any[] => {
    return nodes
      .filter((n) => n.id !== excludeId)
      .map((n) => ({
        value: n.id,
        title: n.name,
        children: n.children ? toSelectData(n.children, excludeId) : [],
      }));
  };

  const findNode = (nodes: JabatanTreeNode[], id: number): JabatanTreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSelect = (selectedKeys: any[]) => {
    if (selectedKeys.length > 0) {
      const node = findNode(tree, Number(selectedKeys[0]));
      setSelectedNode(node);
    } else {
      setSelectedNode(null);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Jabatan berhasil ditambahkan');
      setCreateModalOpen(false);
      createForm.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.detail || 'Gagal menambahkan jabatan');
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedNode) return;
    try {
      await updateMutation.mutateAsync({ id: selectedNode.id, data: values });
      message.success('Jabatan berhasil diperbarui');
      setEditModalOpen(false);
      setSelectedNode({ ...selectedNode, ...values });
    } catch (err: any) {
      message.error(err?.response?.data?.detail || 'Gagal memperbarui jabatan');
    }
  };

  const handleMove = async (values: any) => {
    if (!selectedNode) return;
    try {
      await moveMutation.mutateAsync({ id: selectedNode.id, data: { new_parent_id: values.new_parent_id || null } });
      message.success('Jabatan berhasil dipindahkan');
      setMoveModalOpen(false);
      moveForm.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.detail || 'Gagal memindahkan jabatan');
    }
  };

  const handleDelete = () => {
    if (!selectedNode) return;
    Modal.confirm({
      title: 'Hapus Jabatan',
      content: `Yakin ingin menghapus "${selectedNode.name}"? Jika jabatan memiliki bawahan, jabatan bawahan akan dipindahkan ke induknya.`,
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(selectedNode.id);
          message.success('Jabatan berhasil dihapus');
          setSelectedNode(null);
        } catch (err: any) {
          message.error(err?.response?.data?.detail || 'Gagal menghapus jabatan');
        }
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Struktur Jabatan"
        subtitle="Kelola hirarki organisasi, jabatan struktural, dan fungsional"
        breadcrumbs={[{ title: 'Dashboard', path: '/dashboard' }, { title: 'Jabatan' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Tambah Jabatan
          </Button>
        }
      />

      <Spin spinning={isLoading}>
        <Flex gap={16} wrap="wrap">
          {/* Tree Panel */}
          <Card
            title={<span className="flex items-center gap-2"><ApartmentOutlined /> Hirarki Organisasi</span>}
            className="border-0 shadow-sm flex-1 min-w-[320px]"
          >
            {tree.length === 0 ? (
              <Empty description="Belum ada data jabatan" />
            ) : (
              <Tree
                showLine
                defaultExpandAll
                treeData={toAntTreeData(tree)}
                onSelect={handleSelect}
                selectedKeys={selectedNode ? [selectedNode.id] : []}
                className="py-2"
              />
            )}
          </Card>

          {/* Detail Panel */}
          <Card
            title="Detail Jabatan"
            className="border-0 shadow-sm flex-1 min-w-[320px]"
            extra={
              selectedNode && (
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => { editForm.setFieldsValue(selectedNode); setEditModalOpen(true); }}>
                    Edit
                  </Button>
                  <Button icon={<DragOutlined />} onClick={() => setMoveModalOpen(true)}>
                    Pindah
                  </Button>
                  <Button danger icon={<DeleteOutlined />} onClick={handleDelete} />
                </Space>
              )
            }
          >
            {selectedNode ? (
              <div>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Nama Jabatan">{selectedNode.name}</Descriptions.Item>
                  <Descriptions.Item label="Deskripsi">{selectedNode.description || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Level Hirarki">{selectedNode.level}</Descriptions.Item>
                  <Descriptions.Item label="Jumlah Bawahan">{selectedNode.children?.length || 0}</Descriptions.Item>
                </Descriptions>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                Pilih salah satu jabatan di pohon hirarki untuk melihat detail
              </div>
            )}
          </Card>
        </Flex>
      </Spin>

      {/* Modal Tambah */}
      <Modal
        title="Tambah Jabatan"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} className="mt-4">
          <Form.Item name="name" label="Nama Jabatan" rules={[{ required: true, message: 'Wajib diisi' }]}>
            <Input placeholder="cth. Kepala Bagian Kepegawaian" />
          </Form.Item>
          <Form.Item name="description" label="Deskripsi">
            <Input placeholder="Deskripsi jabatan..." />
          </Form.Item>
          <Form.Item name="parent_id" label="Jabatan Induk (Atasan Langsung)">
            <TreeSelect treeData={toSelectData(tree)} placeholder="Pilih atasan (kosongkan jika posisi puncak)" allowClear treeDefaultExpandAll />
          </Form.Item>
          <Flex justify="flex-end" gap={8} className="mt-6">
            <Button onClick={() => setCreateModalOpen(false)}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Simpan</Button>
          </Flex>
        </Form>
      </Modal>

      {/* Modal Edit */}
      <Modal
        title="Edit Jabatan"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit} className="mt-4">
          <Form.Item name="name" label="Nama Jabatan" rules={[{ required: true, message: 'Wajib diisi' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Deskripsi">
            <Input />
          </Form.Item>
          <Flex justify="flex-end" gap={8} className="mt-6">
            <Button onClick={() => setEditModalOpen(false)}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>Simpan</Button>
          </Flex>
        </Form>
      </Modal>

      {/* Modal Pindah */}
      <Modal
        title="Pindahkan Jabatan"
        open={moveModalOpen}
        onCancel={() => setMoveModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={moveForm} layout="vertical" onFinish={handleMove} className="mt-4">
          <div className="mb-4">
            <Text>Pindahkan <Text strong>{selectedNode?.name}</Text> ke bawah atasan baru:</Text>
          </div>
          <Form.Item name="new_parent_id" label="Atasan Baru">
            <TreeSelect
              treeData={toSelectData(tree, selectedNode?.id)}
              placeholder="Pilih atasan baru (kosongkan jika puncak)"
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>
          <Flex justify="flex-end" gap={8} className="mt-6">
            <Button onClick={() => setMoveModalOpen(false)}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={moveMutation.isPending}>Pindahkan</Button>
          </Flex>
        </Form>
      </Modal>
    </div>
  );
}
