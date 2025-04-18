'use client';

import * as React from 'react';
import {
  AudioWaveform,
  BookOpen,
  Bot,
  ChartLine,
  Command,
  Frame,
  GalleryVerticalEnd,
  Image,
  Map,
  PieChart,
  Settings2,
  Sigma,
  SquareTerminal,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

// This is sample data.
const data = {
  navMain: [
    /*
    {
      title: 'Playground',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'New File',
          url: '#',
        },
        {
          title: 'History',
          url: '#',
        },
        {
          title: 'Favorites',
          url: '#',
        },
      ],
    },
    */
    {
      title: 'Math',
      url: '/math',
      icon: Sigma,
      isActive: true,
      items: [
        {
          title: 'Wave Functions',
          url: '/math',
        },
      ],
    },
    {
      title: 'Stocks',
      url: '/stocks',
      icon: ChartLine,
      isActive: true,
      items: [
        {
          title: 'Stocks',
          url: '/stocks',
        },
      ],
    },
    {
      title: 'Image',
      url: '/image',
      icon: Image,
      isActive: true,
      items: [
        {
          title: 'Interactive',
          url: '/interactive',
        },
        /*
        {
          title: 'Wave Translation',
          url: '/translation',
        },*/
      ],
    },
    {
      title: 'Documentation',
      url: '/documentation',
      icon: BookOpen,
      items: [
        {
          title: 'Math',
          url: '/documentation/math',
        },
        {
          title: 'Stocks',
          url: '/documentation/stocks',
        },
        {
          title: 'Image',
          url: '/documentation/image',
        },
        /*
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },*/
      ],
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings2, // Make sure to import Settings2 from lucide-react
      items: [
        {
          title: 'Audio Processing',
          url: '/settings',
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant='inset' collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
