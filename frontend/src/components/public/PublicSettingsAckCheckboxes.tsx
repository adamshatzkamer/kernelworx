/**
 * Acknowledgement checkboxes for public order settings.
 */
import { Box, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';

interface PublicSettingsAckCheckboxesProps {
  acknowledgementsAccepted: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const PublicSettingsAckCheckboxes: React.FC<PublicSettingsAckCheckboxesProps> = ({
  acknowledgementsAccepted,
  onChange,
  disabled = false,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Acknowledgements
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={acknowledgementsAccepted}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
            />
          }
          label="I acknowledge that enabling public orders allows customers to place orders without authentication."
        />
      </FormGroup>
    </Box>
  );
};