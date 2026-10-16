/**
 * Payment method checklist for public order settings.
 */
import { Box, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';

interface PublicSettingsMethodChecklistProps {
  allowedPaymentMethods: string[];
  onChange: (methods: string[]) => void;
  disabled?: boolean;
}

export const PublicSettingsMethodChecklist: React.FC<PublicSettingsMethodChecklistProps> = ({
  allowedPaymentMethods,
  onChange,
  disabled = false,
}) => {
  // Common payment method options
  const allOptions = ['Cash', 'Check', 'Visa', 'MasterCard', 'American Express', 'Discover'];
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Allowed Payment Methods
      </Typography>
      <FormGroup>
        {allOptions.map((method) => (
          <FormControlLabel
            key={method}
            control={
              <Checkbox
                checked={allowedPaymentMethods.includes(method)}
                onChange={() => {
                  const updated = allowedPaymentMethods.includes(method)
                    ? allowedPaymentMethods.filter((m) => m !== method)
                    : [...allowedPaymentMethods, method];
                  onChange(updated);
                }}
                disabled={disabled}
              />
            }
            label={method}
          />
        ))}
      </FormGroup>
    </Box>
  );
};
