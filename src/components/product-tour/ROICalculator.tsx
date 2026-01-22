import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Calculator, TrendingUp, Clock, DollarSign, Users,
  ArrowRight, CheckCircle2, IndianRupee
} from 'lucide-react';

export function ROICalculator() {
  const [students, setStudents] = useState(1000);
  const [faculty, setFaculty] = useState(50);
  const [adminStaff, setAdminStaff] = useState(10);
  const [manualHours, setManualHours] = useState(40);
  
  const [results, setResults] = useState({
    timeSaved: 0,
    costSavings: 0,
    efficiency: 0,
    breakeven: 0
  });

  // Animated counter state
  const [displayResults, setDisplayResults] = useState({
    timeSaved: 0,
    costSavings: 0,
    efficiency: 0,
    breakeven: 0
  });

  useEffect(() => {
    // ROI Calculations
    const hoursPerStudentPerMonth = 0.5; // Time saved per student per month
    const hoursPerFacultyPerMonth = 2; // Time saved per faculty per month
    const avgHourlyRate = 200; // INR per hour for admin work
    
    const monthlyTimeSaved = 
      (students * hoursPerStudentPerMonth) + 
      (faculty * hoursPerFacultyPerMonth) +
      (manualHours * 0.7); // 70% automation of manual tasks
    
    const annualTimeSaved = monthlyTimeSaved * 12;
    const annualCostSavings = annualTimeSaved * avgHourlyRate;
    
    const currentEfficiency = 100;
    const newEfficiency = Math.min(100, currentEfficiency + (monthlyTimeSaved / (adminStaff * 160)) * 100);
    const efficiencyGain = Math.round(newEfficiency - 40); // Assuming 40% baseline efficiency
    
    // Breakeven calculation (assuming ₹50,000/month for EduFlow)
    const monthlySubscription = 50000;
    const monthlySavings = annualCostSavings / 12;
    const breakevenMonths = monthlySavings > 0 ? Math.ceil(monthlySubscription / monthlySavings * 3) : 12;
    
    setResults({
      timeSaved: Math.round(annualTimeSaved),
      costSavings: Math.round(annualCostSavings),
      efficiency: Math.min(95, efficiencyGain),
      breakeven: Math.min(12, Math.max(1, breakevenMonths))
    });
  }, [students, faculty, adminStaff, manualHours]);

  // Animate results
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;
    
    const startValues = { ...displayResults };
    const targetValues = results;
    
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setDisplayResults({
        timeSaved: Math.round(startValues.timeSaved + (targetValues.timeSaved - startValues.timeSaved) * progress),
        costSavings: Math.round(startValues.costSavings + (targetValues.costSavings - startValues.costSavings) * progress),
        efficiency: Math.round(startValues.efficiency + (targetValues.efficiency - startValues.efficiency) * progress),
        breakeven: Math.round(startValues.breakeven + (targetValues.breakeven - startValues.breakeven) * progress)
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [results]);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Calculator className="h-3 w-3 mr-1" />
            ROI Calculator
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Calculate Your Savings
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how much time and money EduFlow can save your institution
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Your Institution Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-medium">Number of Students</label>
                    <span className="text-2xl font-bold text-primary">{students.toLocaleString()}</span>
                  </div>
                  <Slider
                    value={[students]}
                    onValueChange={([value]) => setStudents(value)}
                    min={100}
                    max={10000}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>100</span>
                    <span>10,000</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-medium">Number of Faculty</label>
                    <span className="text-2xl font-bold text-primary">{faculty}</span>
                  </div>
                  <Slider
                    value={[faculty]}
                    onValueChange={([value]) => setFaculty(value)}
                    min={10}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>10</span>
                    <span>500</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-medium">Admin Staff Count</label>
                    <span className="text-2xl font-bold text-primary">{adminStaff}</span>
                  </div>
                  <Slider
                    value={[adminStaff]}
                    onValueChange={([value]) => setAdminStaff(value)}
                    min={2}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>2</span>
                    <span>50</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-medium">Weekly Manual Admin Hours</label>
                    <span className="text-2xl font-bold text-primary">{manualHours}h</span>
                  </div>
                  <Slider
                    value={[manualHours]}
                    onValueChange={([value]) => setManualHours(value)}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>10 hours</span>
                    <span>100 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <div className="space-y-6">
              <Card className="shadow-glow border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Your Estimated Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-background/50 rounded-xl">
                      <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-blue-500">
                        {displayResults.timeSaved.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Hours Saved/Year</div>
                    </div>
                    
                    <div className="text-center p-4 bg-background/50 rounded-xl">
                      <IndianRupee className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-green-500">
                        {formatCurrency(displayResults.costSavings)}
                      </div>
                      <div className="text-sm text-muted-foreground">Annual Savings</div>
                    </div>
                    
                    <div className="text-center p-4 bg-background/50 rounded-xl">
                      <TrendingUp className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-amber-500">
                        {displayResults.efficiency}%
                      </div>
                      <div className="text-sm text-muted-foreground">Efficiency Gain</div>
                    </div>
                    
                    <div className="text-center p-4 bg-background/50 rounded-xl">
                      <Calculator className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-purple-500">
                        {displayResults.breakeven}
                      </div>
                      <div className="text-sm text-muted-foreground">Months to Breakeven</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">What This Means For You</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>{Math.round(displayResults.timeSaved / 2080)} full-time employees</strong> worth of work automated annually
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        Your staff can focus on <strong>student success</strong> instead of paperwork
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Zero errors</strong> in fee collection, attendance, and record keeping
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>24/7 accessibility</strong> for students, parents, and staff
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Button size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-elegant group">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
