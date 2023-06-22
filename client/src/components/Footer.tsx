import React from 'react';
import Box from '@mui/material/Box';
import { useTranslations } from '@src/stores/TranslationContext';

export default function Footer() {
    const { tr } = useTranslations();
    return (
        <Box component="footer" sx={{
            fontSize: '.8rem',
            padding: '0.5rem 1rem 0',
            '& ul': {
              padding: 0,
              '& li': {
                display: 'inline-block',
                marginLeft: '.8em',
                '&::before': {
                  content: '"•"',
                  marginRight: '.8em',
                }
              }
            }
          }}
        >
            <nav>
                <ul>
                    <li>
                        <a href="https://www.tampere.fi/asioi-kaupungin-kanssa/oskari-karttakyselypalvelun-saavutettavuusseloste">{tr.FooterLinks.accessibility}</a>
                    </li>
                </ul>
            </nav>
        </Box>
    )
}