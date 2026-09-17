import { useEffect, useState } from 'react';
import { App, Card, Tree, Button, Modal, Form, Space, Descriptions, Tag, Spin, Empty, Flex } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined, ApartmentOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import JabatanTreeSelect from '../../components/jabatan/JabatanTreeSelect';
import JabatanFormFields from './jabatan/JabatanFormFields';
import { useJabatanTree, useCreateJabatan, useUpdateJabatan, useMoveJabatan, useDeleteJabatan } from '../../hooks/useJabatan';
import { TIPE_JABATAN_LABEL } from '../../config/labels';
import { getErrorMessage } from '../../utils/apiError';
import type { JabatanCreate, JabatanTreeNode, JabatanUpdate } from '../../types/jabatan';
import type { DataNode } from 'antd/es/tree';
import type { Key } from 'react';

function findNode(nodes: JabatanTreeNode[], id: number): JabatanTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function nodeTitle(node: JabatanTreeNode) {
  return (
    <span className={!node.is_active ? 'text-gray-400 line-through' : ''}>
      {node.name}{' '}
      {node.tipe && <Tag className="ml-1">{TIPE_JABATAN_LABEL[node.tipe]}</Tag>}
      {node.is_pejabat && <Tag color="blue" className="ml-1">Pejabat</Tag>}
      {node.allow_plt && <Tag color="purple" className="ml-1">Plt</Tag>}
      {node.allow_plh && <Tag color="purple" className="ml-1">Plh</Tag>}
      {!node.is_active && <Tag color="default" className="ml-1">Nonaktif</Tag>}
    </span>
  );
}

function toAntTreeData(nodes: JabatanTreeNode[]): DataNode[] {
  return nodes.map((node) => ({
    key: node.id,
    title: nodeTitle(node),
    children: node.children ? toAntTreeData(node.children) : [],
  }));
}

export default function JabatanPage() {
  const { message: msg, modal } = App.useApp();
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

  useEffect(() => {
    if (selectedNode) {
      const fresh = findNode(tree, selectedNode.id);
      if (fresh !== selectedNode) setSelectedNode(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

  const handleSelect = (selectedKeys: Key[]) => {
    if (selectedKeys.length > 0) {
      setSelectedNode(findNode(tree, Number(selectedKeys[0])));
    } else {
      setSelectedNode(null);
    }
  };

  const cleanNullable = <T extends object>(values: T, fields: (keyof T)[]): T => {
    const result: Record<string, unknown> = { ...(values as Record<string, unknown>) };
    for (const field of fields) {
      if (result[field as string] === '' || result[field as string] === undefined) {
        result[field as string] = null;
      }
    }
    return result as T;
  };

  const handleCreate = async (values: JabatanCreate) => {
    const data = { ...values };
    if (!data.kode) delete data.kode;
    try {
      await createMutation.mutateAsync(data);
      msg.success('Jabatan berhasil ditambahkan');
      setCreateModalOpen(false);
      createForm.resetFields();
    } catch (err) {
      msg.error(getErrorMessage(err, 'Gagal menambahkan jabatan'));
    }
  };

  const handleEdit = async (values: JabatanUpdate) => {
    if (!selectedNode) return;
    const data = cleanNullable(values, ['description', 'kelompok', 'tipe']);
    if (!data.kode) delete data.kode;
    try {
      await updateMutation.mutateAsync({ id: selectedNode.id, data });
      msg.success('Jabatan berhasil diperbarui');
      setEditModalOpen(false);
    } catch (err) {
      msg.error(getErrorMessage(err, 'Gagal memperbarui jabatan'));
    }
  };

  const handleMove = async (values: { new_parent_id?: number }) => {
    if (!selectedNode) return;
    try {
      await moveMutation.mutateAsync({ id: selectedNode.id, data: { new_parent_id: values.new_parent_id || null } });
      msg.success('Jabatan berhasil dipindahkan');
      setMoveModalOpen(false);
      moveForm.resetFields();
    } catch (err) {
      msg.error(getErrorMessage(err, 'Gagal memindahkan jabatan'));
    }
  };

  const handleDelete = () => {
    if (!selectedNode) return;
    modal.confirm({
      title: 'Hapus Jabatan',
      content: `Yakin ingin menghapus "${selectedNode.name}"? Jabatan bawahan akan dipindahkan ke induknya. Jabatan yang pernah memiliki penugasan tidak dapat dihapus; nonaktifkan jabatan tersebut.`,
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(selectedNode.id);
          msg.success('Jabatan berhasil dihapus');
          setSelectedNode(null);
        } catch (err) {
          msg.error(getErrorMessage(err, 'Gagal menghapus jabatan'));
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
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Nama">{selectedNode.name}</Descriptions.Item>
                <Descriptions.Item label="Kode"><span className="font-mono">{selectedNode.kode}</span></Descriptions.Item>
                <Descriptions.Item label="Deskripsi">{selectedNode.description || '-'}</Descriptions.Item>
                <Descriptions.Item label="Kelompok">{selectedNode.kelompok || '-'}</Descriptions.Item>
                <Descriptions.Item label="Tipe">{selectedNode.tipe ? TIPE_JABATAN_LABEL[selectedNode.tipe] : '-'}</Descriptions.Item>
                <Descriptions.Item label="Pejabat">{selectedNode.is_pejabat ? 'Ya' : 'Tidak'}</Descriptions.Item>
                <Descriptions.Item label="Izinkan Plt">{selectedNode.allow_plt ? 'Ya' : 'Tidak'}</Descriptions.Item>
                <Descriptions.Item label="Izinkan Plh">{selectedNode.allow_plh ? 'Ya' : 'Tidak'}</Descriptions.Item>
                <Descriptions.Item label="Urutan">{selectedNode.urutan}</Descriptions.Item>
                <Descriptions.Item label="Status">{selectedNode.is_active ? 'Aktif' : 'Nonaktif'}</Descriptions.Item>
                <Descriptions.Item label="Level">{selectedNode.level}</Descriptions.Item>
                <Descriptions.Item label="Jumlah Bawahan Langsung">{selectedNode.children?.length || 0}</Descriptions.Item>
              </Descriptions>
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
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} className="mt-4">
          <JabatanFormFields form={createForm} mode="create" tree={tree} />
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
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit} className="mt-4">
          <JabatanFormFields form={editForm} mode="edit" />
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
        destroyOnHidden
      >
        <Form form={moveForm} layout="vertical" onFinish={handleMove} className="mt-4">
          <div className="mb-4">
            Pindahkan <strong>{selectedNode?.name}</strong> ke bawah atasan baru:
          </div>
          <Form.Item name="new_parent_id" label="Atasan Baru">
            <JabatanTreeSelect
              tree={tree}
              excludeId={selectedNode?.id}
              placeholder="Pilih atasan baru (kosongkan jika puncak)"
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
