import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

interface StrengthResult {
  score: number; // 0-5
  label: string;
  color: string;
  requirements: Requirement[];
}

function calculateStrength(password: string): StrengthResult {
  const requirements: Requirement[] = [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Contains a number',
      met: /\d/.test(password),
    },
    {
      label: 'Contains special character (@$!%*?&)',
      met: /[@$!%*?&]/.test(password),
    },
  ];

  const metCount = requirements.filter(r => r.met).length;
  
  // Bonus for length
  const lengthBonus = password.length >= 12 ? 1 : 0;
  const score = Math.min(5, metCount + lengthBonus);

  let label: string;
  let color: string;

  switch (true) {
    case score === 0:
      label = 'Very Weak';
      color = 'bg-destructive';
      break;
    case score === 1:
      label = 'Weak';
      color = 'bg-destructive';
      break;
    case score === 2:
      label = 'Fair';
      color = 'bg-orange-500';
      break;
    case score === 3:
      label = 'Good';
      color = 'bg-yellow-500';
      break;
    case score === 4:
      label = 'Strong';
      color = 'bg-green-500';
      break;
    case score >= 5:
      label = 'Very Strong';
      color = 'bg-green-600';
      break;
    default:
      label = 'Very Weak';
      color = 'bg-destructive';
  }

  return { score, label, color, requirements };
}

export function PasswordStrength({ 
  password, 
  showRequirements = true,
  className 
}: PasswordStrengthProps) {
  const { score, label, color, requirements } = useMemo(
    () => calculateStrength(password),
    [password]
  );

  const progressValue = (score / 5) * 100;

  if (!password) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Password Strength</span>
          <span className={cn(
            "text-xs font-medium",
            score <= 1 ? "text-destructive" : 
            score <= 2 ? "text-orange-500" : 
            score <= 3 ? "text-yellow-600" : 
            "text-green-600"
          )}>
            {label}
          </span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300", color)}
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <ul className="space-y-1">
          {requirements.map((req, index) => (
            <li
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                req.met ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {req.met ? (
                <Check className="h-3 w-3 flex-shrink-0" />
              ) : (
                <X className="h-3 w-3 flex-shrink-0" />
              )}
              <span>{req.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PasswordStrength;
