"use client";

import Link from "next/link";
import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BarChartIcon from "@mui/icons-material/BarChart";

const features = [
  {
    href: "/departments",
    icon: <ApartmentIcon color="primary" fontSize="large" />,
    title: "Departamentos",
    description: "Cadastre e organize os departamentos acadêmicos da instituição.",
  },
  {
    href: "/professors",
    icon: <PeopleIcon color="primary" fontSize="large" />,
    title: "Professores",
    description: "Gerencie o corpo docente, vinculado a cada departamento, com validação de CPF.",
  },
  {
    href: "/courses",
    icon: <MenuBookIcon color="primary" fontSize="large" />,
    title: "Cursos",
    description: "Cadastre as disciplinas oferecidas para alocação de horários.",
  },
  {
    href: "/allocations",
    icon: <CalendarMonthIcon color="primary" fontSize="large" />,
    title: "Alocações",
    description: "Monte a grade de horários, com detecção automática de conflito de agenda.",
  },
];

export default function LandingPage() {
  return (
    <Box>
      <Box
        sx={{
          textAlign: "center",
          py: { xs: 6, sm: 10 },
          px: 2,
        }}
      >
        <Chip label="Trabalho acadêmico — Front-end" color="secondary" sx={{ mb: 2 }} />
        <Typography variant="h2" component="h1" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "2rem", sm: "3rem" } }}>
          Professor Allocation
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 640, mx: "auto", mb: 4 }}>
          Sistema web para gerenciar professores, departamentos, cursos e a alocação de horários
          de aula, com detecção automática de conflito de agenda.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          <Button component={Link} href="/allocations" variant="contained" size="large">
            Ver alocações
          </Button>
          <Button component={Link} href="/dashboard" variant="outlined" size="large" startIcon={<BarChartIcon />}>
            Ver dashboard
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((feature) => (
          <Grid key={feature.href} size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 1 }}>{feature.icon}</Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={Link} href={feature.href} size="small">
                  Acessar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: "center", pb: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Front-end em Next.js + Material UI, consumindo a API REST desenvolvida em Spring Boot
          (projeto Professor Allocation).
        </Typography>
      </Box>
    </Box>
  );
}
