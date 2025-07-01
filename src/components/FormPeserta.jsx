import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  useToast,
  chakra,
} from '@chakra-ui/react';
import { useState, useRef, useEffect, forwardRef } from 'react';
import SignaturePad from 'react-signature-canvas';
import Turnstile from 'react-turnstile';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import id from 'date-fns/locale/id'; // ← locale Indonesia
registerLocale('id', id);

// ⏬ Komponen DatePicker dengan auto open saat fokus
const DatePickerWrapper = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  const CustomInput = forwardRef(({ value, onClick, onFocus }, ref) => (
    <Input
      ref={ref}
      value={value || ''}
      readOnly 
      onClick={onClick}
      onFocus={(e) => {
        onClick(e);     // buka kalender saat fokus
        onFocus?.(e);
      }}
      placeholder="Pilih tanggal"
      autoComplete="off"
    />
  ));

  return (
    <DatePicker
    locale="id"
      selected={value ? new Date(value) : null}
      onChange={onChange}
      dateFormat="dd-MM-yyyy"
      customInput={<CustomInput />}
      showPopperArrow={false}
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      maxDate={new Date()}
      open={open}
      onClickOutside={() => setOpen(false)}
      onSelect={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setTimeout(() => setOpen(false), 150)}
    />
  );
};

export default function FormPeserta() {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat_rumah: '',
    no_hp: '',
    utusan: '',
    jabatan: '',
    alamat_kantor: '',
    nomor_rekening: '',
    nama_bank: '',
    atas_nama: '',
  });

  const [captchaToken, setCaptchaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sigPadRef = useRef();
  const turnstileRef = useRef();
  const toast = useToast();

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = sigPadRef.current?.getCanvas();
      if (!canvas) return;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const context = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      context?.scale(ratio, ratio);
      sigPadRef.current?.clear();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const sitekey = import.meta.env.VITE_TURNSTILE_SITEKEY;

  const resetForm = () => {
    setFormData({
      nama_lengkap: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      alamat_rumah: '',
      no_hp: '',
      utusan: '',
      jabatan: '',
      alamat_kantor: '',
      nomor_rekening: '',
      nama_bank: '',
      atas_nama: '',
    });
    sigPadRef.current?.clear();
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      toast({
        title: 'Verifikasi CAPTCHA belum selesai.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!/^[0-9]{10,13}$/.test(formData.no_hp)) {
      toast({
        title: 'Nomor HP tidak valid.',
        description: 'Gunakan 10–13 digit angka.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (new Date(formData.tanggal_lahir) > new Date()) {
      toast({
        title: 'Tanggal lahir tidak valid.',
        description: 'Tidak boleh lebih dari hari ini.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (sigPadRef.current?.isEmpty()) {
      toast({
        title: 'Tanda tangan kosong.',
        description: 'Silakan isi tanda tangan terlebih dahulu.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    const signatureImage = sigPadRef.current
      ?.getTrimmedCanvas()
      ?.toDataURL('image/png');
    data.append('tanda_tangan', signatureImage);
    data.append('cf-turnstile-response', captchaToken);

    try {
      const res = await fetch('http://localhost:8000/api/peserta', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) throw new Error('Gagal mengirim data');

      toast({
        title: 'Sukses!',
        description: 'Data berhasil dikirim.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      resetForm();
    } catch (error) {
      toast({
        title: 'Terjadi kesalahan.',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg="gray.50" minH="100vh" py={10} px={4}>
      <Box
        maxW="700px"
        w="full"
        bg="white"
        mx="auto"
        p={{ base: 4, md: 6 }}
        borderRadius="lg"
        boxShadow="md"
      >
        <Heading
          size="md"
          mb={6}
          textAlign="center"
          color="green.800"
          textTransform="uppercase"
          letterSpacing="wide"
        >
          Biodata Peserta FGD Manajemen Data dan Informasi <br />
          Lembaga Keagamaan dan Majelis Taklim
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            {[
              ['nama_lengkap', 'Nama Lengkap'],
              ['tempat_lahir', 'Tempat Lahir'],
              ['tanggal_lahir', 'Tanggal Lahir', 'datepicker'],
              ['alamat_rumah', 'Alamat Rumah', 'textarea'],
              ['no_hp', 'No HP'],
              ['utusan', 'Utusan'],
              ['jabatan', 'Jabatan'],
              ['alamat_kantor', 'Alamat Kantor', 'textarea'],
              ['nomor_rekening', 'Nomor Rekening'],
              ['nama_bank', 'Nama Bank'],
              ['atas_nama', 'Atas Nama Rekening'],
            ].map(([name, label, type]) => (
              <FormControl
                key={name}
                isRequired={['nama_lengkap', 'tempat_lahir', 'tanggal_lahir', 'alamat_rumah', 'no_hp'].includes(name)}
              >
                <FormLabel htmlFor={name}>{label}</FormLabel>
                {type === 'textarea' ? (
                  <Textarea id={name} name={name} value={formData[name]} onChange={handleChange} />
                ) : type === 'datepicker' ? (
                  <DatePickerWrapper
                    value={formData[name]}
                    onChange={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        [name]: date?.toISOString().split('T')[0] || '',
                      }))
                    }
                  />
                ) : (
                  <Input
                    id={name}
                    name={name}
                    type="text"
                    value={formData[name]}
                    onChange={handleChange}
                  />
                )}
              </FormControl>
            ))}

            <FormControl isRequired>
              <FormLabel htmlFor="tanda_tangan">Tanda Tangan</FormLabel>
              <Box border="1px" borderColor="gray.300" borderRadius="md" p={2}>
                <Box width="100%" height="200px" position="relative">
                  <SignaturePad
                    ref={sigPadRef}
                    canvasProps={{
                      id: 'tanda_tangan',
                      name: 'tanda_tangan',
                      style: {
                        width: '100%',
                        height: '100%',
                        touchAction: 'none',
                        borderRadius: '4px',
                      },
                    }}
                  />
                </Box>
              </Box>
              <Button mt={2} size="sm" onClick={() => sigPadRef.current?.clear()}>
                Hapus Tanda Tangan
              </Button>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Verifikasi CAPTCHA</FormLabel>
              <Box w="full" minH="70px">
                <Box
                  id="turnstile-container"
                  sx={{
                    iframe: {
                      width: '100% !important',
                      maxWidth: '100%',
                    },
                  }}
                >
                  <Turnstile
                    ref={turnstileRef}
                    sitekey={sitekey}
                    onSuccess={(token) => setCaptchaToken(token)}
                    style={{ width: '100%' }}
                  />
                </Box>
              </Box>
            </FormControl>

            <Button
              type="submit"
              colorScheme="green"
              w="full"
              isLoading={isSubmitting}
              loadingText="Menyimpan..."
            >
              Simpan Data
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}
