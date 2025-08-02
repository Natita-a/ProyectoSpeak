import React, { useState } from 'react';
import { Modal, Box, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function MyModal() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Acción que ocurre al hacer clic en "Aceptar"
  const handleAceptar = () => {
    console.log('Has aceptado');
    setOpen(false);
  };

  return (
    <div>
      <Button variant="contained" onClick={handleOpen}>
        Abrir Modal
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          {/* Tache (cerrar) */}
          <IconButton
            aria-label="cerrar"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" component="h2">
            Confirmación
          </Typography>
          <Typography sx={{ mt: 2 }}>
            ¿Estás seguro de que deseas continuar?
          </Typography>

          {/* Botones de acción */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleAceptar}>
              Aceptar
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
