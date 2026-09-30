"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Alert,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";
import { subscribeMockMode } from "@/lib/mockMode";

const links = [
  { href: "/", label: "Início" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/departments", label: "Departamentos" },
  { href: "/courses", label: "Cursos" },
  { href: "/professors", label: "Professores" },
  { href: "/allocations", label: "Alocações" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => subscribeMockMode(setMockMode), []);

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      {mockMode && (
        <Alert severity="warning" variant="filled" sx={{ borderRadius: 0, justifyContent: "center" }}>
          Modo demonstração: não foi possível conectar à API — exibindo dados de exemplo.
        </Alert>
      )}
      <Toolbar sx={{ maxWidth: 1100, mx: "auto", width: "100%" }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setDrawerOpen(true)}
          sx={{ mr: 1, display: { xs: "inline-flex", md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <SchoolIcon sx={{ mr: 1, display: { xs: "none", sm: "inline-flex" } }} />
        <Typography
          variant="h6"
          component={Link}
          href="/"
          noWrap
          sx={{ flexGrow: 1, color: "inherit", textDecoration: "none", fontSize: { xs: "1rem", sm: "1.25rem" } }}
        >
          Professor Allocation
        </Typography>

        <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
          {links.map((link) => (
            <Button
              key={link.href}
              component={Link}
              href={link.href}
              color="inherit"
              sx={{
                fontWeight: pathname === link.href ? 700 : 400,
                textDecoration: pathname === link.href ? "underline" : "none",
              }}
            >
              {link.label}
            </Button>
          ))}
        </Stack>
      </Toolbar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            {links.map((link) => (
              <ListItemButton key={link.href} component={Link} href={link.href} selected={pathname === link.href}>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
