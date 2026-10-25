"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createItemAction,
  deleteItemAction,
  updateItemAction,
} from "./item.actions";
import type { ItemInput } from "./item.schema";

export const itemKeys = {
  all: ["item"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) => [...itemKeys.lists(), params] as const,
};

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ItemInput) => createItemAction(input),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ItemInput }) =>
      updateItemAction(id, input),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItemAction(id),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}
