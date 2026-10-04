import logoSso from '../../assets/logo-sso.png';
import logoSsoTeks from '../../assets/logo-sso-teks.png';

interface BrandLogoProps {
  /** Sisi gambar dalam piksel (logo berbentuk bulat, jadi lebar = tinggi). */
  size?: number;
  /** Pakai versi dengan tulisan "SSO Pengadilan Agama Ngawi" (hanya untuk latar terang). */
  withText?: boolean;
  className?: string;
}

/** Logo SSO Pengadilan Agama Ngawi dengan latar transparan. */
export default function BrandLogo({ size = 40, withText = false, className = '' }: BrandLogoProps) {
  return (
    <img
      src={withText ? logoSsoTeks : logoSso}
      width={size}
      height={size}
      alt="Logo SSO Pengadilan Agama Ngawi"
      draggable={false}
      className={`shrink-0 select-none object-contain ${className}`}
    />
  );
}
