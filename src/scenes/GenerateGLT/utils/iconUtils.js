import { 
    RefreshCw, 
    AlertCircle, 
    TrendingUp, 
    Users, 
    UserCheck, 
    Clock, 
    UserPlus, 
    UserMinus, 
    PieChart, 
    UserCog, 
    GraduationCap, 
    Building2, 
    Target, 
    CalendarCheck, 
    UserX, 
    PauseCircle, 
    HandHelping, 
    FileCheck, 
    FileX, 
    ChartBar
  } from "lucide-react";
  
  export const iconMap = {
    // Current Status Icons
    "Currently Paired Clients": UserCheck,
    "Currently Paired w/ Awaiting": UserCog,
    "TOTAL no. of Clients Paying MSF": TrendingUp,
    "TOTAL Paying MSF": TrendingUp,
  
    // Training and Client Type Icons
    "Clients w/ CBs on Training": GraduationCap,
    "Training Clients": GraduationCap,
    "Trade Clients": Building2,
    "Maps Credit Clients": PieChart,
    "Maps Credit": PieChart,
  
    // Total and Matched Icons
    "TOTAL Matched Clients": Users,
    "TOTAL Matched": Users,
    "TOTAL no. of Clients": Users,
    "Total Clients": Users,
  
    // Company Type Icons
    "MAPS Clients": Building2,
    "MAPS": Building2,
    "KW Clients": Building2,
    "KW": Building2,
    "Other Clients": Users,
    "Others": Users,
  
    // Status Icons
    "Clients on Hold": PauseCircle,
    "On Hold": PauseCircle,
    "Suspended Clients": UserX,
    "Suspended": UserX,
    "Pending On Hold": Clock,
    "Pending Hold": Clock,
    "Pending Cancellation": UserMinus,
    "Pending Cancel": UserMinus,
  
    // Process Icons
    "Clients for Matching": HandHelping,
    "Clients Waiting (1st Cyberbacker)": Clock,
    "Clients With One Sheet (w/ OS)": FileCheck,
    "With One Sheet": FileCheck,
    "Clients Without One Sheet (w/o OS)": FileX,
    "Without One Sheet": FileX,
  
    // Demographics and Status Icons
    "Key Target Demographics": Target,
    "Knows Cyberbacker": UserCheck,
    "Lead": UserPlus,
    "Appointment Set": CalendarCheck,
    "Appointment Kept": CalendarCheck,
    "Winback": UserPlus,
    "Canceled": UserX,
  
    // Revenue Icons
    "Total Revenue Clients": TrendingUp,
    "Revenue Clients": TrendingUp
  };
  
  export const getIconForMetric = (metricName) => {
    return iconMap[metricName] || Users; // Default to Users icon if no match found
  };
  
  // Special icons for different sections
  export const sectionIcons = {
    currentStatus: Users,
    clientCategories: Building2,
    clientBreakdown: PieChart,
    pendingStatus: Clock,
    additionalMetrics: ChartBar,
    totals: TrendingUp
  };
  
  // UI related icons
  export const uiIcons = {
    refresh: RefreshCw,
    alert: AlertCircle,
    loading: RefreshCw
  };