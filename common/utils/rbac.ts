import {
  ACTION_COLUMN,
  type Action,
} from "@/common/constants/rbac.constant";

// ["read","edit"], true → { isRead: true, isEdit: true }
export function actionsToColumns(actions: readonly Action[], value: boolean) {
  return Object.fromEntries(actions.map((a) => [ACTION_COLUMN[a], value])) as Partial<
    Record<(typeof ACTION_COLUMN)[Action], boolean>
  >;
}

// ["read","edit"] → { isRead: true, isAdd: false, isEdit: true, isDelete: false }
export function actionsToFlags(granted: readonly Action[]) {
  return {
    isRead: granted.includes("read"),
    isAdd: granted.includes("add"),
    isEdit: granted.includes("edit"),
    isDelete: granted.includes("delete"),
  };
}
