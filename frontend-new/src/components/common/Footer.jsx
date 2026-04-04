import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import logoImage from '../../assets/logo.png';

export default function Footer() {
  const footerLinks = [
    {
      title: 'Shop',
      links: ['Categories', 'Bundles', 'Near You'],
    },
    {
      title: 'Policy',
      links: ['Shipping Policy', 'Privacy', 'Terms of Service'],
    },
    {
      title: 'Company',
      links: ['About Us', 'Contact Us'],
    },
  ];

  return (
    <Box sx={{ width: '100%', bgcolor: '#EBEFE5', borderRadius: '32px 32px 0px 0px' }}>
      <Container maxWidth={false} sx={{ maxWidth: 1280, px: 3, py: '48px' }}>
        {/* Main Footer Content */}
        <Grid container spacing={6} sx={{ mb: 6 }}>
          {/* About Section */}
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <img 
                src={logoImage} 
                alt="ShortDate Logo"
                style={{
                  height: '32px',
                  objectFit: 'contain',
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"Manrope","Inter",system-ui,sans-serif',
                  fontWeight: 900,
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#0D631B',
                  letterSpacing: '-0.45px',
                }}
              >
                ShortDate
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: '"Inter",system-ui,sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '20px',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                color: '#475569',
                mb: 1,
              }}
            >
              Reducing waste, one meal at a time. Every bite counts.
            </Typography>
          </Grid>

          {/* Links Sections */}
          {footerLinks.map((section) => (
            <Grid item xs={6} md={3} key={section.title}>
              <Typography
                sx={{
                  fontFamily: '"Inter",system-ui,sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '1.4px',
                  textTransform: 'uppercase',
                  color: '#0D631B',
                  mb: 2,
                }}
              >
                {section.title}
              </Typography>
              <Stack spacing={1}>
                {section.links.map((link) => (
                  <Typography
                    key={link}
                    sx={{
                      fontFamily: '"Inter",system-ui,sans-serif',
                      fontWeight: 400,
                      fontSize: '12px',
                      lineHeight: '16px',
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      color: '#475569',
                      cursor: 'pointer',
                      '&:hover': {
                        color: '#0D631B',
                      },
                    }}
                  >
                    {link}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        {/* Divider */}
        <Box
          sx={{
            my: 3,
            borderTop: '1px solid rgba(191, 202, 186, 0.1)',
          }}
        />

        {/* Copyright */}
        <Typography
          sx={{
            fontFamily: '"Inter",system-ui,sans-serif',
            fontWeight: 400,
            fontSize: '10px',
            lineHeight: '15px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#475569',
            opacity: 0.8,
          }}
        >
          © 2026 ShortDate. 
        </Typography>
      </Container>
    </Box>
  );
}

