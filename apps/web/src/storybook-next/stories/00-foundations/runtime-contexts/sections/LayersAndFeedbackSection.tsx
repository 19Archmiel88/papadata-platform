import { useMemo, useState } from 'react';

import { StoryPresentationSection } from '../../../../presentation/StoryPresentation';
import {
  AlertDialog,
  BackgroundOperationItem,
  BottomSheet,
  Button,
  DataList,
  Dialog,
  Drawer,
  EmptyState,
  ErrorState,
  InlineNotice,
  Menu,
  OverlayRoot,
  Popover,
  ProgressIndicator,
  Skeleton,
  Spinner,
  StatusBadge,
  Toast,
  Tooltip,
} from '../../../../../design-system/components';
import type { MenuItem } from '../../../../../design-system/components/Menu';
import { RuntimeSequence } from '../RuntimeSequence';
import type { OverlayName } from '../runtime-context-data';
import type { PushEvidence } from '../runtime-context-types';

export function LayersAndFeedbackSection({
  pushEvidence,
}: {
  readonly pushEvidence: PushEvidence;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuActive, setMenuActive] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [overlay, setOverlay] = useState<OverlayName>(null);
  const menuItems: readonly MenuItem[] = useMemo(() => [
    { icon: 'data', id: 'open', label: 'Otwórz raport' },
    { id: 'separator-1', kind: 'separator' },
    { checked: true, icon: 'success', id: 'pin', label: 'Przypnij widok', shortcut: 'P' },
    { destructive: true, icon: 'warning', id: 'remove', label: 'Usuń filtr' },
  ], []);

  return (
    <StoryPresentationSection
            index="05"
            layout="wide"
            summary="Warstwy są interaktywne i zamknięte domyślnie, żeby nie zakrywały dokumentu. Dowód działania pojawia się po otwarciu."
            title="Warstwy, menu i komunikaty"
          >
            <div className="pd-c83-flow">
              <RuntimeSequence
                evidenceLabel="Menu, Popover, Tooltip, Dialog, AlertDialog, Drawer, OverlayRoot i BottomSheet działają z kontrolkami otwarcia."
                title="Kontrolowane warstwy UI"
              >
                <div className="pd-c83-layer-actions">
                  <Menu
                    activeItemId={menuActive}
                    items={menuItems}
                    open={menuOpen}
                    placement="bottom-start"
                    trigger={<Button size="small" variant="secondary">Menu akcji</Button>}
                    onAction={(itemId) => {
                      setMenuOpen(false);
                      pushEvidence(`Menu wykonało akcję: ${itemId}.`);
                    }}
                    onActiveItemIdChange={setMenuActive}
                    onOpenChange={(open) => {
                      setMenuOpen(open);
                      pushEvidence(`Menu ${open ? 'otwarte' : 'zamknięte'}.`);
                    }}
                  />
                  <Popover
                    actionLabel="Zastosuj"
                    anchorId="pd-c83-popover-anchor"
                    description="Popover trzyma kontekst filtra przy kontrolce."
                    modal={false}
                    open={popoverOpen}
                    placement="bottom"
                    title="Szybki filtr"
                    trigger={<Button id="pd-c83-popover-anchor" size="small" variant="secondary">Popover filtra</Button>}
                    onOpenChange={(open) => {
                      setPopoverOpen(open);
                      pushEvidence(`Popover ${open ? 'otwarty' : 'zamknięty'}.`);
                    }}
                  >
                    <p>Filtr nie przenosi użytkownika poza przepływ raportu.</p>
                  </Popover>
                  <Tooltip
                    content="Tooltip działa na hover i focus bez zmiany układu."
                    delayMs={0}
                    interactive={false}
                    placement="top"
                    trigger={<Button size="small" variant="ghost">Tooltip</Button>}
                  />
                  <Button size="small" variant="secondary" onClick={() => setOverlay('dialog')}>Dialog</Button>
                  <Button size="small" variant="danger" onClick={() => setOverlay('alert')}>AlertDialog</Button>
                  <Button size="small" variant="secondary" onClick={() => setOverlay('drawer')}>Drawer</Button>
                  <Button size="small" variant="secondary" onClick={() => setOverlay('bottom-sheet')}>BottomSheet</Button>
                  <Button size="small" variant="secondary" onClick={() => setOverlay('overlay-root')}>OverlayRoot</Button>
                </div>
                <Dialog
                  closeOnBackdrop
                  closeOnEscape
                  description="Dialog blokuje decyzję do czasu wyboru akcji."
                  modal
                  open={overlay === 'dialog'}
                  primaryActionLabel="Zapisz"
                  secondaryActionLabel="Anuluj"
                  title="Ustawienia widoku"
                  onOpenChange={(open) => {
                    setOverlay(open ? 'dialog' : null);
                    pushEvidence('Dialog zmienił stan otwarcia.');
                  }}
                >
                  <p>Zmiana zostanie zapisana dla bieżącego workspace.</p>
                </Dialog>
                <AlertDialog
                  cancelLabel="Anuluj"
                  confirmLabel="Usuń"
                  destructive
                  message="Operacja usunie filtr z widoku."
                  open={overlay === 'alert'}
                  title="Usunąć filtr?"
                  onCancel={() => pushEvidence('AlertDialog anulował operację.')}
                  onConfirm={() => {
                    setOverlay(null);
                    pushEvidence('AlertDialog potwierdził operację destrukcyjną.');
                  }}
                  onOpenChange={(open) => setOverlay(open ? 'alert' : null)}
                />
                <Drawer
                  description="Drawer pokazuje szczegóły bez opuszczania raportu."
                  dismissible
                  open={overlay === 'drawer'}
                  primaryActionLabel="Zastosuj"
                  secondaryActionLabel="Anuluj"
                  side="right"
                  title="Szczegóły kampanii"
                  width={420}
                  onOpenChange={(open) => {
                    setOverlay(open ? 'drawer' : null);
                    pushEvidence('Drawer zmienił stan otwarcia.');
                  }}
                >
                  <DataList
                    density="compact"
                    items={[
                      { description: 'ROAS 4.1x', id: 'roas', status: { status: 'Sygnał', text: 'Szansa', tone: 'success' }, title: 'Wynik kampanii' },
                      { description: 'Meta Ads opóźnione 15 min', id: 'meta-delay', status: { status: 'Dane', text: 'Częściowe', tone: 'warning' }, title: 'Jakość danych' },
                    ]}
                  />
                </Drawer>
                <BottomSheet
                  description="Warstwa mobilna dla akcji widoku."
                  dismissible
                  open={overlay === 'bottom-sheet'}
                  primaryActionLabel="Zastosuj"
                  snapPoint="content"
                  title="Ustawienia mobilne"
                  onOpenChange={(open) => {
                    setOverlay(open ? 'bottom-sheet' : null);
                    pushEvidence('BottomSheet zmienił stan otwarcia.');
                  }}
                >
                  <p>BottomSheet nie tworzy osobnej nawigacji.</p>
                </BottomSheet>
                <OverlayRoot
                  backdrop="subtle"
                  open={overlay === 'overlay-root'}
                  onBackdropClick={() => {
                    setOverlay(null);
                    pushEvidence('OverlayRoot zamknął warstwę przez tło.');
                  }}
                >
                  <div className="pd-c83-overlay-proof" role="dialog" aria-modal="true" aria-label="Dowód OverlayRoot">
                    <h3>OverlayRoot</h3>
                    <p>Wspólny host dla warstw modalnych i pomocniczych.</p>
                    <Button size="small" onClick={() => setOverlay(null)}>Zamknij</Button>
                  </div>
                </OverlayRoot>
              </RuntimeSequence>

              <RuntimeSequence
                evidenceLabel="InlineNotice, Toast, EmptyState, ErrorState, Skeleton, Spinner, ProgressIndicator i BackgroundOperationItem pokazują realne stany operacji."
                title="Statusy i operacje w tle"
              >
                <InlineNotice
                  actionLabel="Otwórz źródła"
                  message="Część danych Meta Ads jest opóźniona, ale raport pozostaje używalny."
                  title="Dane częściowe"
                  tone="warning"
                  onAction={() => pushEvidence('InlineNotice przekazał użytkownika do źródeł.')}
                />
                <Toast
                  actionLabel="Cofnij"
                  dismissible
                  message="Widok kampanii został zapisany."
                  title="Zapisano"
                  toastId="saved-view"
                  tone="success"
                  onAction={() => pushEvidence('Toast wykonał akcję cofnięcia.')}
                  onDismiss={() => pushEvidence('Toast został zamknięty.')}
                />
                <div className="pd-c83-status-line">
                  <StatusBadge status="Dane" text="Częściowe" tone="warning" />
                  <StatusBadge status="Decyzja" text="W przeglądzie" tone="info" />
                  <StatusBadge status="Ryzyko" text="Niskie" tone="success" />
                </div>
                <div className="pd-c83-loading-line">
                  <Skeleton animated height="1rem" lines={3} shape="text" width="16rem" />
                  <Spinner delayMs={0} label="Przeliczanie segmentów" showLabel size={20} />
                  <ProgressIndicator
                    description="Import przetworzył część plików i kontynuuje pracę."
                    indeterminate={false}
                    label="Import klientów"
                    max={100}
                    showValue
                    tone="neutral"
                    value={64}
                  />
                </div>
                <BackgroundOperationItem
                  actionLabel="Ponów import"
                  actionVariant="secondary"
                  description="Import zakończył się błędem sieciowym i można go ponowić."
                  errorCode="NETWORK_RETRYABLE"
                  operationId="op-import"
                  progress={42}
                  startedAt="2026-08-16T01:48:00+01:00"
                  status="failed"
                  title="Import wymagający ponowienia"
                  onAction={() => pushEvidence('BackgroundOperationItem ponowił import.')}
                />
                <div className="pd-c83-state-line">
                  <EmptyState
                    message="Nie ma kampanii spełniających aktywne filtry."
                    primaryActionLabel="Wyczyść filtry"
                    title="Brak wyników"
                    variant="search"
                    onPrimaryAction={() => pushEvidence('EmptyState wyczyścił filtry.')}
                  />
                  <ErrorState
                    correlationId="corr-148"
                    errorCode="DATA_SOURCE_TIMEOUT"
                    message="Nie udało się pobrać danych z jednego źródła."
                    retryLabel="Ponów"
                    supportLabel="Kontakt ze wsparciem"
                    title="Błąd źródła"
                    variant="integration"
                    onRetry={() => pushEvidence('ErrorState uruchomił ponowienie.')}
                    onSupport={() => pushEvidence('ErrorState otworzył wsparcie.')}
                  />
                </div>
              </RuntimeSequence>
            </div>
          </StoryPresentationSection>
  );
}
