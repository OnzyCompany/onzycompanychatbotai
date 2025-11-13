import React, { useMemo } from 'react';
import { Tenant } from '../types';
import ChatbotWidget from '../components/ChatbotWidget';

interface EmbedPageProps {
  tenant: Tenant;
}

const EmbedPage: React.FC<EmbedPageProps> = ({ tenant }) => {
  const tenantThemeStyle = useMemo(() => {
    return {
      '--tenant-color': tenant.cor,
    } as React.CSSProperties;
  }, [tenant]);

  return (
    <div style={tenantThemeStyle} className="bg-transparent w-full h-full">
      <ChatbotWidget tenant={tenant} />
    </div>
  );
};

export default EmbedPage;
