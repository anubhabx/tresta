import trestaLogo from '../assets/tresta-logo.svg?raw';
import { WIDGET_BRANDING_URL } from '../config/env';

export function createBrandingBadge(): HTMLElement {
  const badgeWrapper = document.createElement('div');
  badgeWrapper.className = 'tresta-branding-badge';

  const link = document.createElement('a');
  link.href = WIDGET_BRANDING_URL;
  link.target = '_blank';
  link.rel = 'noreferrer noopener';
  link.className = 'tresta-branding-link';
  link.setAttribute('aria-label', 'Powered by Tresta');

  const logoContainer = document.createElement('span');
  logoContainer.className = 'tresta-branding-logo';
  logoContainer.innerHTML = trestaLogo;

  const text = document.createElement('span');
  text.className = 'tresta-branding-text';
  text.textContent = 'Powered by Tresta';

  link.appendChild(logoContainer);
  link.appendChild(text);
  badgeWrapper.appendChild(link);

  return badgeWrapper;
}
