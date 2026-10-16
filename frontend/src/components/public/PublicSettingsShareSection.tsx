/**
 * Share section for public order settings.
 */
import { Box, Typography } from '@mui/material';

interface PublicSettingsShareSectionProps {
  campaignId: string;
  shareToken: string | null;
  campaignName: string;
}

export const PublicSettingsShareSection: React.FC<PublicSettingsShareSectionProps> = ({
  campaignId,
  shareToken,
  campaignName,
}) => {
  const shareUrl = shareToken ? `/o/${campaignId}/${shareToken}` : null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Share Link for {campaignName}
      </Typography>
      {shareUrl ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">
            Share this link to allow customers to place public orders:
          </Typography>
          <Typography variant="body2" fontFamily="monospace">
            {shareUrl}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="error">
          Share link not available. Enable public orders to generate a share link.
        </Typography>
      )}
    </Box>
  );
};