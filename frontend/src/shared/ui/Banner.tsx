import { Container } from "./Container";

interface BannerProps {
  children: React.ReactNode;
  backgroundImage?: string;
  backgroundColor?: string;
  overlay?: boolean;
  overlayColor?: string;
  className?: string;
  useContainer?: boolean;
  backgroundPosition?: string;
  style?: React.CSSProperties;
}

export function Banner({
  children,
  backgroundImage,
  backgroundColor,
  overlay = false,
  overlayColor = "rgba(0,0,0,0.5)",
  className,
  useContainer = true,
  backgroundPosition = "center",
  style,
}: BannerProps) {
  return (
    <section
      className={`relative w-full ${className ?? ""}`}
      style={{
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition,
        ...style,
      }}
    >
      {overlay && (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: overlayColor }} />
      )}
      <div className="relative z-10">
        {useContainer ? <Container>{children}</Container> : children}
      </div>
    </section>
  );
}
