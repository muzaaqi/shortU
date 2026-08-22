/**
 * Per-link interstitial ad mode switch.
 * Features instant optimistic UI updating with TanStack Query.
 * Used by: src/components/link-card.tsx
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memo } from "react";
import { Switch } from "~/components/ui/switch";
import { toggleAdMode } from "~/server/functions/links";

interface AdToggleProps {
  linkId: string;
  adEnabled: boolean;
  className?: string;
}

export const AdToggle = memo(function AdToggle({
  linkId,
  adEnabled,
  className,
}: AdToggleProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newVal: boolean) =>
      toggleAdMode({ data: { id: linkId, adEnabled: newVal } }),
    onMutate: async (newVal) => {
      await queryClient.cancelQueries({ queryKey: ["links", "list"] });
      const previousLinks = queryClient.getQueryData<
        Array<{ id: string; adEnabled: boolean }>
      >(["links", "list"]);

      queryClient.setQueryData<Array<{ id: string; adEnabled: boolean }>>(
        ["links", "list"],
        (old) =>
          old?.map((item) =>
            item.id === linkId ? { ...item, adEnabled: newVal } : item
          )
      );

      return { previousLinks };
    },
    onError: (_err, _newVal, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(["links", "list"], context.previousLinks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links", "list"] });
    },
  });

  return (
    <div className={className}>
      <Switch
        checked={adEnabled}
        onCheckedChange={(checked) => mutation.mutate(checked)}
        disabled={mutation.isPending}
        aria-label="Toggle interstitial ad mode"
      />
    </div>
  );
});
