import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";



const FollowUp = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [searchParams, setSearchParams] = useState({
    id: '',
    name: '',
    contact: '',
    email: ''
  });

  // Placeholder for follow-up data
  const followUpData = [
    // ... your follow-up data here
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic here
    console.log('Searching for:', searchParams);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'contact', headerName: 'Contact', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'designation', headerName: 'Designation', width: 130 },
    { field: 'company', headerName: 'Company', width: 150 },
    { field: 'state', headerName: 'State', width: 120 },
    { field: 'country', headerName: 'Country', width: 120 },
    { field: 'action', headerName: 'Action', width: 150, 
      renderCell: (params) => {
        // You can render a custom component or action buttons here
        return <div>Action Buttons</div>;
      }
    },
  ];

  return (
    <Box sx={{ height: '75vh', width: '100%', bgcolor: 'background.default', p: 4 }}>
      <h1 style={{ color: theme.palette.text.primary }}>Follow Up Table</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
          <input
            type="text"
            placeholder="Id"
            name="id"
            value={searchParams.id}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={searchParams.name}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Contact"
            name="contact"
            value={searchParams.contact}
            onChange={handleInputChange}
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={searchParams.email}
            onChange={handleInputChange}
          />
          <button type="submit">Search</button>
        </div>
        </form>
      
<Box
  m="40px 0 0 0"
  height="75vh"
  sx={{
    "& .MuiDataGrid-root": {
      border: "none",
    },
    "& .MuiDataGrid-cell": {
      borderBottom: "none",
      position: 'relative', // Needed for absolute positioning of the pseudo-element
      "&::after": {
        content: '""', // Pseudo-elements require a content property
        position: 'absolute',
        top: '10%', // Start the line a bit from the top of the cell
        right: 0,
        bottom: '10%', // End the line a bit from the bottom of the cell
        width: '2px', // The thickness of your separator
        backgroundColor: theme.palette.divider, // The color of your separator
      },
    },
    "& .MuiDataGrid-cell:last-child::after": {
      display: 'none', // Do not display the separator after the last cell
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: colors.blueAccent[700],
      borderBottom: "none",
      "& .MuiDataGrid-columnHeader": {
        position: 'relative',
        "&::after": {
          content: '""',
          position: 'absolute',
          top: '25%', // Adjust the top value to match the cell separator if needed
          right: 0,
          bottom: '25%', // Adjust the bottom value to match the cell separator if needed
          width: '2px', // The thickness of your header separator
          backgroundColor: theme.palette.divider,
        },
      },
      "& .MuiDataGrid-columnHeader:last-child::after": {
        display: 'none',
      },
      "& .MuiDataGrid-columnSeparator": {
        display: "none",
      },
      "& .MuiDataGrid-columnHeaderTitleContainer": {
        paddingRight: 0,
      },
    },
    "& .MuiDataGrid-virtualScroller": {
      backgroundColor: colors.primary[400],
    },
    "& .MuiDataGrid-footerContainer": {
      borderTop: "none",
      backgroundColor: colors.blueAccent[700],
    },
        }}
      >
        <DataGrid 
          rows={followUpData}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default FollowUp;