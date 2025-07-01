import { Box, Container } from '@chakra-ui/react';
import Header from './components/Header';
import FormPeserta from './components/FormPeserta';

export default function App() {
  return (
    <Box bg="green.50" minH="100vh" py={8}>
      {/* HEADER DI LUAR CONTAINER */}
      <Box textAlign="center" mb={6}>
        <Header />
      </Box>

      {/* FORM DI DALAM CONTAINER */}
      <Container maxW="4xl" bg="white" p={6} borderRadius="lg" boxShadow="md">
        <FormPeserta />
      </Container>
    </Box>
  );
}
