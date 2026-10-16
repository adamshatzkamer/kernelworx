/**
 * Action buttons for public order settings.
 */
import { Box, Button, Stack, Typography } from '@mui/material';

interface PublicSettingsActionsProps {
  onSave: () => void;
  enabled: boolean;
  onRotate: () => void;
  onDisable: () => void;
  onEnable: () => void;
  saving: boolean;
}

type SettingsAction = 'save' | 'enable' | 'disable';

/** The save/enable/disable actions share one disable rule: pending, or already in the target state. */
const actionDisabled = (action: SettingsAction, saving: boolean, enabled: boolean): boolean =>
  saving || (action === 'enable' ? enabled : !enabled);

const rotateDisabled = (saving: boolean, enabled: boolean): boolean => !enabled || saving;

const actionLabel = (saving: boolean, label: string): string => (saving ? 'Saving...' : label);

export const PublicSettingsActions: React.FC<PublicSettingsActionsProps> = ({
  enabled,
  onRotate,
  onDisable,
  onEnable,
  onSave,
  saving,
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Actions
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={onSave} disabled={actionDisabled('save', saving, enabled)}>
          {actionLabel(saving, 'Save')}
        </Button>
        <Button variant="contained" onClick={onEnable} disabled={actionDisabled('enable', saving, enabled)}>
          {actionLabel(saving, 'Enable')}
        </Button>
        <Button variant="contained" onClick={onDisable} disabled={actionDisabled('disable', saving, enabled)}>
          {actionLabel(saving, 'Disable')}
        </Button>
        <Button variant="outlined" onClick={onRotate} disabled={rotateDisabled(saving, enabled)}>
          Rotate Share Token
        </Button>
      </Stack>
    </Box>
  );
};
