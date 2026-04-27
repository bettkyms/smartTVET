import React, { useRef } from 'react';
import { Image as ImageIcon, Edit2, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface BrandingSectionProps {
  institutionName: string;
  setInstitutionName: (val: string) => void;
  customLogo: string | null;
  setCustomLogo: (val: string | null) => void;
  className?: string;
  label?: string;
}

const BrandingSection: React.FC<BrandingSectionProps> = ({
  institutionName,
  setInstitutionName,
  customLogo,
  setCustomLogo,
  className,
  label = "Institution Branding"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
        <ImageIcon className="w-3 h-3" />
        {label}
      </label>
      
      <div className="space-y-3">
        <input 
          type="text" 
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
          placeholder="Institution Name"
          className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-500 outline-none text-sm font-bold transition-all dark:text-white"
        />
        
        <div className="flex items-center gap-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-all overflow-hidden group relative shrink-0"
          >
            {customLogo ? (
              <>
                <img src={customLogo} alt="Logo" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <Edit2 className="w-4 h-4 text-white" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <ImageIcon className="w-5 h-5 text-slate-300" />
              </div>
            )}
          </div>
          <div className="flex-grow">
            <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">Upload Logo</p>
            <p className="text-[9px] text-slate-400 font-medium">Reflects in generated tools</p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
            {customLogo && (
              <button 
                onClick={() => setCustomLogo(null)}
                className="mt-1 text-[9px] font-black text-rose-600 uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingSection;
