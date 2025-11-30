import React, { useState } from "react";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  TextField,
  Button,
  Paper,
} from "@mui/material";

const Period = () => {
  const [openRow, setOpenRow] = useState(null);

  // Dummy sample data (replace with API response)
  const data = [
    {
      id: 1,
      name: "JOHN DOE",
      mobile: "9876543210",
      email: "john.doe@example.com",
      totalInvoices: 3,
      totalAmount: 390846,
      balanceAmount: 30000,
      invoices: [
        {
          invoiceNo: "INV003",
          date: "06-11-2025",
          totalAmt: 260541.62,
          oldAmt: 0,
          schemeAmt: 0,
          netAmt: 260542,
          paidAmt: 230542,
          balAmt: 30000,
        },
        {
          invoiceNo: "INV001",
          date: "06-11-2025",
          totalAmt: 4635,
          oldAmt: 0,
          schemeAmt: 0,
          netAmt: 4635,
          paidAmt: 4635,
          balAmt: 0,
        },
        {
          invoiceNo: "INV002",
          date: "06-11-2025",
          totalAmt: 125669.33,
          oldAmt: 0,
          schemeAmt: 0,
          netAmt: 125669,
          paidAmt: 125669,
          balAmt: 0,
        },
      ],
    },
  ];

  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  return (
    <Box p={3}>
      {/* Search + Date Filter Row */}
      <Box display="flex" gap={2} mb={3}>
        <TextField label="Search..." size="small" fullWidth />

        <TextField type="date" size="small" />
        <TextField type="date" size="small" />

        <Button variant="contained" color="primary">
          OK
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell><strong>Account Name</strong></TableCell>
              <TableCell><strong>Mobile</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Total Invoices</strong></TableCell>
              <TableCell><strong>Total Amount</strong></TableCell>
              <TableCell><strong>Balance Amount</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row) => (
              <>
                {/* MAIN ROW */}
                <TableRow key={row.id}>
                  <TableCell>
                    <IconButton onClick={() => toggleRow(row.id)}>
                      {openRow === row.id ? (
                        <KeyboardArrowUp />
                      ) : (
                        <KeyboardArrowDown />
                      )}
                    </IconButton>
                  </TableCell>

                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.mobile}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.totalInvoices}</TableCell>
                  <TableCell>{row.totalAmount}</TableCell>
                  <TableCell>{row.balanceAmount}</TableCell>
                </TableRow>

                {/* DROPDOWN (Nested Invoice Table) */}
                {openRow === row.id && (
                  <TableRow>
                    <TableCell colSpan={7} style={{ background: "#fafafa" }}>
                      <Box p={2} border="1px solid #e0e0e0" borderRadius={2}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Invoice No.</TableCell>
                              <TableCell>Date</TableCell>
                              <TableCell>Total Amt</TableCell>
                              <TableCell>Old Amt</TableCell>
                              <TableCell>Scheme Amt</TableCell>
                              <TableCell>Net Amt</TableCell>
                              <TableCell>Paid Amt</TableCell>
                              <TableCell>Bal Amt</TableCell>
                              <TableCell>Receipts</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {row.invoices.map((inv, index) => (
                              <TableRow key={index}>
                                <TableCell>{inv.invoiceNo}</TableCell>
                                <TableCell>{inv.date}</TableCell>
                                <TableCell>{inv.totalAmt}</TableCell>
                                <TableCell>{inv.oldAmt}</TableCell>
                                <TableCell>{inv.schemeAmt}</TableCell>
                                <TableCell>{inv.netAmt}</TableCell>
                                <TableCell>{inv.paidAmt}</TableCell>
                                <TableCell>{inv.balAmt}</TableCell>
                                <TableCell>
                                  <Button variant="contained" size="small" color="success">
                                    Add Receipt
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default Period;
