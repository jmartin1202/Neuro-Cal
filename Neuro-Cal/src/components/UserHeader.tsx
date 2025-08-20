import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Brain, Calendar, Settings, LogOut, User, Bell, Plus, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export const UserHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                NeuroCal
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                Calendar
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Brain className="w-4 h-4" />
                AI Insights
              </Button>
              <Link to="/crm">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Users className="w-4 w-4" />
                  CRM
                </Button>
              </Link>
            </nav>
          </div>

          {/* Center - Quick Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsCreatingEvent(true)}
            >
              <Plus className="w-4 h-4" />
              Quick Event
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </Button>
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-3">
            {/* User Status */}
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Online
              </Badge>
            </div>

            {/* User Avatar and Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.firstName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {user ? getInitials(user.firstName, user.lastName) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
