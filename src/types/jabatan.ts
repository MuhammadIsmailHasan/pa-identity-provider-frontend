export interface Jabatan {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface JabatanTreeNode {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  level: number;
  lft: number;
  rgt: number;
  children: JabatanTreeNode[];
}

export interface JabatanCreate {
  name: string;
  description?: string;
  parent_id?: number | null;
}

export interface JabatanUpdate {
  name?: string;
  description?: string;
}

export interface JabatanMove {
  new_parent_id: number | null;
  position?: number;
}
