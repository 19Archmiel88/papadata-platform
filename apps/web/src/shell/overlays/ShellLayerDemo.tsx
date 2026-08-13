import {
  Dialog,
  InlineNotice,
} from '../../design-system';

export function ShellLayerDemo({
  onOpenChange,
  open,
}: {
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
}) {
  return (
    <Dialog
      closeOnBackdrop
      closeOnEscape
      description="Warstwa testowa potwierdza jeden OverlayRoot i kolejność dialogów."
      modal
      onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
      open={open}
      primaryActionLabel="Potwierdź"
      secondaryActionLabel="Anuluj"
      title="Test globalnej warstwy"
    >
      <InlineNotice
        message="Dialog, drawer, command palette i mobile shell używają tego samego systemu warstw."
        title="OverlayRoot jest wspólny"
        tone="info"
      />
    </Dialog>
  );
}
