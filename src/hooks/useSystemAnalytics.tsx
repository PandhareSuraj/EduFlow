import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemAnalyticsData {
  systemOverview: {
    totalColleges: number;
    totalUsers: number;
    totalStudents: number;
    healthScore: number;
  };
  collegeMetrics: CollegeMetric[];
  userAnalytics: {
    totalUsers: number;
    roleDistribution: RoleDistribution[];
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
  performanceMetrics: {
    dbHealth: string;
    apiResponseTime: string;
    uptime: string;
    systemHealth: {
      overall: number;
      uptime: number;
      performance: number;
      database: number;
      apiResponse: number;
      memory: number;
      storage: number;
    };
    dataIntegrity: {
      overall: number;
    };
    security: {
      overall: number;
      authentication: number;
      encryption: number;
      accessControl: number;
      auditCompliance: number;
    };
  };
}

interface CollegeMetric {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  userCount: number;
  facultyCount: number; 
  activityScore: number;
  dataQuality: number;
  systemHealth: number;
  revenue: number;
  growthRate: number;
  status: string;
  lastUpdated: string;
  alerts?: string[];
}

interface RoleDistribution {
  role: string;
  count: number;
}

export function useSystemAnalytics() {
  const [data, setData] = useState<SystemAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemAnalytics();
  }, []);

  const fetchSystemAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch colleges
      const { data: colleges, error: collegesError } = await supabase
        .from('colleges')
        .select('*');

      if (collegesError) throw collegesError;

      // Fetch students
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('college_id, status');

      if (studentsError) throw studentsError;

      // Fetch faculty
      const { data: faculty, error: facultyError } = await supabase
        .from('faculty')
        .select('college_id, status');

      if (facultyError) throw facultyError;

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('college_id, role');

      if (rolesError) throw rolesError;

      // Calculate system overview
      const totalColleges = colleges.length;
      const totalUsers = userRoles.length;
      const totalStudents = students.filter(s => s.status === 'active').length;
      const healthScore = calculateSystemHealth();

      // Calculate college metrics
      const collegeMetrics: CollegeMetric[] = colleges.map(college => {
        const collegeStudents = students.filter(s => s.college_id === college.id && s.status === 'active');
        const collegeFaculty = faculty.filter(f => f.college_id === college.id && f.status === 'active');
        const collegeUsers = userRoles.filter(u => u.college_id === college.id);

        return {
          id: college.id,
          name: college.name,
          code: college.code,
          studentCount: collegeStudents.length,
          userCount: collegeUsers.length,
          facultyCount: collegeFaculty.length,
          activityScore: calculateActivityScore(college.id, collegeStudents.length, collegeFaculty.length),
          dataQuality: calculateDataQuality(college, collegeStudents.length, collegeFaculty.length),
          systemHealth: calculateSystemHealth(collegeStudents.length, collegeFaculty.length),
          revenue: calculateRevenue(collegeStudents.length, collegeUsers.length),
          growthRate: calculateGrowthRate(collegeStudents.length),
          status: college.status,
          lastUpdated: new Date().toISOString(),
          alerts: generateAlerts(collegeStudents.length, collegeFaculty.length)
        };
      });

      // Calculate user analytics
      const roleDistribution: RoleDistribution[] = userRoles.reduce((acc, user) => {
        const existingRole = acc.find(r => r.role === user.role);
        if (existingRole) {
          existingRole.count++;
        } else {
          acc.push({ role: user.role, count: 1 });
        }
        return acc;
      }, [] as RoleDistribution[]);

      // Mock active user data (in real app, this would come from activity logs)
      const dailyActiveUsers = Math.floor(totalUsers * 0.3);
      const weeklyActiveUsers = Math.floor(totalUsers * 0.6);
      const monthlyActiveUsers = Math.floor(totalUsers * 0.8);

      setData({
        systemOverview: {
          totalColleges,
          totalUsers,
          totalStudents,
          healthScore
        },
        collegeMetrics,
        userAnalytics: {
          totalUsers,
          roleDistribution,
          dailyActiveUsers,
          weeklyActiveUsers,
          monthlyActiveUsers
        },
        performanceMetrics: {
          dbHealth: '99.2%',
          apiResponseTime: '120ms',
          uptime: '99.8%',
          systemHealth: {
            overall: 92,
            uptime: 99,
            performance: 88,
            database: 95,
            apiResponse: 85,
            memory: 67,
            storage: 45,
          },
          dataIntegrity: {
            overall: 94,
          },
          security: {
            overall: 89,
            authentication: 95,
            encryption: 98,
            accessControl: 85,
            auditCompliance: 78,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching system analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSystemHealth = (studentCount?: number, facultyCount?: number): number => {
    // Mock calculation - in real app, this would check various system metrics
    let score = 85;
    if (studentCount && studentCount > 100) score += 5;
    if (facultyCount && facultyCount > 10) score += 5;
    return Math.min(score, 100);
  };

  const calculateRevenue = (studentCount: number, userCount: number): number => {
    // Mock revenue calculation based on students and users
    return Math.floor((studentCount * 1000) + (userCount * 500) + Math.random() * 10000);
  };

  const calculateGrowthRate = (studentCount: number): number => {
    // Mock growth rate calculation
    return Math.floor(Math.random() * 20) - 5; // Random between -5 to 15
  };

  const generateAlerts = (studentCount: number, facultyCount: number): string[] => {
    const alerts = [];
    if (studentCount > 200) alerts.push('High student enrollment - consider expanding faculty');
    if (facultyCount < 5) alerts.push('Faculty shortage detected');
    if (Math.random() > 0.7) alerts.push('System maintenance pending');
    return alerts;
  };

  const calculateActivityScore = (collegeId: string, studentCount: number, facultyCount: number): number => {
    // Mock activity score based on data completeness and usage
    const baseScore = 60;
    const studentBonus = Math.min(studentCount * 2, 25);
    const facultyBonus = Math.min(facultyCount * 3, 15);
    return Math.min(baseScore + studentBonus + facultyBonus, 100);
  };

  const calculateDataQuality = (college: any, studentCount: number, facultyCount: number): number => {
    // Mock data quality score
    let score = 70;
    
    // Bonus for having complete college info
    if (college.email && college.phone && college.address) score += 10;
    if (college.website) score += 5;
    if (college.logo_url) score += 5;
    
    // Bonus for having students and faculty
    if (studentCount > 0) score += 5;
    if (facultyCount > 0) score += 5;
    
    return Math.min(score, 100);
  };

  return {
    data,
    loading,
    refetch: fetchSystemAnalytics
  };
}