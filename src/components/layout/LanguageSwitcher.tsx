 import { Globe } from 'lucide-react';
 import { useTranslation } from 'react-i18next';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { Button } from '@/components/ui/button';
 
 const languages = [
   { code: 'en', name: 'English', nativeName: 'English' },
   { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
   { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
 ];
 
 export function LanguageSwitcher() {
   const { i18n } = useTranslation();
   
   const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
   
   const changeLanguage = (langCode: string) => {
     i18n.changeLanguage(langCode);
   };
   
   return (
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <Button variant="ghost" size="sm" className="gap-2">
           <Globe className="h-4 w-4" />
           <span className="hidden sm:inline">{currentLang.nativeName}</span>
         </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent align="end">
         {languages.map((lang) => (
           <DropdownMenuItem
             key={lang.code}
             onClick={() => changeLanguage(lang.code)}
             className={i18n.language === lang.code ? 'bg-accent' : ''}
           >
             <span className="mr-2">{lang.nativeName}</span>
             <span className="text-muted-foreground text-xs">({lang.name})</span>
           </DropdownMenuItem>
         ))}
       </DropdownMenuContent>
     </DropdownMenu>
   );
 }