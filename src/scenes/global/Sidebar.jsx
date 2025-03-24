import React, { useState } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Box, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { useAuth } from '../../services/UserContext'; // Adjust the import path as needed

// Define some constants for colors
const textColor = '#000000';
const backgroundColor = '#ffffff';

const Item = ({ title, to, icon, selected, setSelected }) => (
  <MenuItem
    active={selected === title}
    onClick={() => setSelected(title)}
    icon={icon}
  >
    <NavLink
      to={to}
      style={({ isActive }) => ({
        textDecoration: 'none',
        color: isActive ? '#1976d2' : textColor,
      })}
    >
      <Typography>{title}</Typography>
    </NavLink>
  </MenuItem>
);

const CustomSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState('Dashboard');
  const { userRole, subRole } = useAuth(); // Get user roles and subRoles from context

  const renderMenuItems = () => {
    if (!userRole) {
      return <Typography>No Role Assigned</Typography>;
    }

    // Handle multiple roles
    const roles = Array.isArray(userRole) ? userRole : [userRole];

    if (roles.includes('admin')) {
      return (
        <>
          <Item title="Dashboard" to="/growth-dashboard" icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Clients" to="/clients" icon={<PeopleOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Growth Tracker" to="/growth-tracker" icon={<BarChartOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Add to Database" to="/add-to-database" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Duplicates" to="/duplicates" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Referral" to="/referrals" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Reports" to="/reports" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Bulk Update" to="/bulk-update" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
        </>
      );
    }

    if (roles.includes('growthadmin')) {
      return (
        <>
          <Item title="Dashboard" to="/" icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Clients" to="/clients" icon={<PeopleOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Growth Tracker" to="/growth-tracker" icon={<BarChartOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Add to Database" to="/add-to-database" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Duplicates" to="/duplicates" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Referral" to="/referral" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Reports" to="/reports" icon={<BarChartOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Bulk Update" to="/bulk-update" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
        </>
      );
    }

    if (roles.includes('franchise')) {
      // Optionally handle subRoles for franchises
      if (subRole) {
        console.log('Handling subRole:', subRole); // For debugging
      }

      return (
        <>
          <Item title="Dashboard" to="/" icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Clients" to="/clients" icon={<PeopleOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Growth Tracker" to="/growth-tracker" icon={<BarChartOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Add to Database" to="/add-to-database" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Duplicates" to="/duplicates" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
          <Item title="Bulk Update" to="/bulk-update" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />

        </>
      );
    }

    if (roles.includes('referrer')) {
      return (
        <Item title="Referrer" to="/referrer" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
      );
    }

    // Default case for unknown roles
    return <Typography>No Menu Available</Typography>;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        '& .pro-sidebar': {
          background: backgroundColor + ' !important',
          color: textColor + ' !important',
        },
        '& .pro-sidebar-inner': {
          background: backgroundColor + ' !important',
        },
        '& .pro-menu-item': {
          color: textColor + ' !important',
        },
        '& .pro-menu-item.active': {
          color: '#1976d2 !important', // Active item color
        },
      }}
    >
      <Sidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            icon={<MenuOutlinedIcon />}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Typography>Toggle Menu</Typography>
          </MenuItem>
          {renderMenuItems()}
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default CustomSidebar;
