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
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving || !enabled}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          variant="contained"
          onClick={onEnable}
          disabled={saving || enabled}
        >
          {saving ? 'Saving...' : 'Enable'}
        </Button>
        <Button
          variant="contained"
          onClick={onDisable}
          disabled={saving || !enabled}
        >
          {saving ? 'Saving...' : 'Disable'}
        </Button>
        <Button
          variant="outlined"
          onClick={onRotate}
          disabled={!enabled || saving}
        >
          Rotate Share Token
        </Button>
      </Stack>
    </Box>
  );
};
