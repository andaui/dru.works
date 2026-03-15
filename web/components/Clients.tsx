import Image from "next/image";

interface ClientLogo {
  _key: string;
  logo: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  companyName?: string;
}

interface ClientsProps {
  logos: ClientLogo[];
  maxWidth980?: boolean;
}

export default function Clients({ logos, maxWidth980 = false }: ClientsProps) {
  if (!logos || logos.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden flex justify-start md:justify-start">
      <div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 w-full md:w-auto"
        style={{ 
          borderTop: '0.9px solid var(--border)',
          borderLeft: '0.9px solid var(--border)',
          maxWidth: maxWidth980 ? '980px' : '986px',
          padding: 0,
          margin: 0,
        }}
      >
        {logos.map((client) => {
          const logoUrl = client.logo?.asset?.url;
          const altText = client.logo?.alt || client.companyName || 'Client logo';
          
          return (
            <div
              key={client._key}
              className="aspect-[2/1]"
              style={{
                borderRight: '0.9px solid var(--border)',
                borderBottom: '0.9px solid var(--border)',
              }}
            >
              {logoUrl ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    padding: 0,
                    filter: 'var(--client-logo-filter)',
                    opacity: 'var(--client-logo-opacity)',
                  }}
                >
                  <Image
                    src={logoUrl}
                    alt={altText}
                    width={200}
                    height={100}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                    quality={90}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ padding: 0 }}>
                  <span className="text-muted-foreground text-[13px]">{client.companyName || 'Logo'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

