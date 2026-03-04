import { CompanyData } from '@/types';

interface CompanyInfoProps {
  company: CompanyData;
}

export default function CompanyInfo({ company }: CompanyInfoProps) {
  return (
    <div className="bg-white rounded-[8px] border border-border-gray p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)] h-fit">
      <h2 className="text-xl font-bold text-text-primary mb-4">Company Information</h2>
      <div className="prose prose-slate max-w-none">
        <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
          {company.company_info}
        </p>
      </div>
    </div>
  );
}
