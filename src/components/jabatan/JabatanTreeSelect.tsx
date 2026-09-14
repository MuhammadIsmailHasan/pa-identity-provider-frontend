import { TreeSelect } from 'antd';
import type { TreeSelectProps } from 'antd';
import { TIPE_JABATAN_LABEL } from '../../config/labels';
import type { JabatanTreeNode } from '../../types/jabatan';

interface JabatanTreeSelectProps extends Omit<TreeSelectProps, 'treeData'> {
  tree: JabatanTreeNode[];
  /** Node ini beserta seluruh anaknya tidak ditampilkan (mis. saat memindahkan jabatan). */
  excludeId?: number;
  /** Node nonaktif tetap ditampilkan tapi tidak dapat dipilih. */
  onlyActive?: boolean;
}

function buildTreeData(nodes: JabatanTreeNode[], excludeId?: number, onlyActive?: boolean): TreeSelectProps['treeData'] {
  return nodes
    .filter((node) => node.id !== excludeId)
    .map((node) => {
      const label = [node.name, node.tipe ? TIPE_JABATAN_LABEL[node.tipe] : null].filter(Boolean).join(' — ');
      return {
        value: node.id,
        title: (
          <span>
            {node.name} <span className="text-gray-400 text-xs">{node.kode}</span>
            {node.tipe && <span className="text-gray-400 text-xs"> · {TIPE_JABATAN_LABEL[node.tipe]}</span>}
          </span>
        ),
        searchText: `${label} ${node.kode}`,
        disabled: onlyActive ? !node.is_active : undefined,
        children: node.children ? buildTreeData(node.children, excludeId, onlyActive) : undefined,
      };
    });
}

export default function JabatanTreeSelect({ tree, excludeId, onlyActive, ...rest }: JabatanTreeSelectProps) {
  return (
    <TreeSelect
      treeData={buildTreeData(tree, excludeId, onlyActive)}
      treeDefaultExpandAll
      showSearch
      treeNodeFilterProp="searchText"
      allowClear
      {...rest}
    />
  );
}
