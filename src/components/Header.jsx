import { Box, Flex, Image, Heading, Text } from '@chakra-ui/react';

export default function Header() {
  return (
    <Box bg="green.700" color="white" py={{ base: 6, md: 8 }} px={{ base: 4, md: 10 }} w="full">
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="center"
        textAlign={{ base: 'center', md: 'left' }}
        gap={4}
      >
        <Image
          src="/logo_kemenag.svg"
          alt="Logo Kemenag"
          boxSize={{ base: '100px', md: '110px' }} // Logo lebih besar dan jelas
        />

        <Box>
          <Heading fontSize={{ base: 'lg', md: '2xl' }} fontWeight="bold" lineHeight="short">
            Direktorat Jenderal Bimbingan Masyarakat Islam
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }}>
            Direktorat Penerangan Agama Islam
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
