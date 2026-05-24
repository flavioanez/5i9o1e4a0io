document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener los inputs y el botón
    const inputDoko = document.querySelector('input[name="doko"]');
    const inputTiki = document.querySelector('input[name="tiki"]');
    const inputToko = document.querySelector('input[name="toko"]');
    const btnIngresar = document.querySelector('button.ingresar');

    const inputs = [inputDoko, inputTiki, inputToko];

    // Función para encontrar el contenedor principal del campo (mat-lg-field)
    const getFieldContainer = (input) => input.closest('mat-lg-field');
    
    // Función para obtener el contenedor del ojo en tiki y toko
    const getEyeIcon = (input) => {
        const flexContainer = input.closest('.mat-lg-field-flex');
        if (flexContainer) {
            return flexContainer.querySelector('.mat-form-field-suffix');
        }
        return null;
    };

    // Ocultar los ojos por defecto al cargar la página
    const eyeTiki = getEyeIcon(inputTiki);
    const eyeToko = getEyeIcon(inputToko);
    if (eyeTiki) eyeTiki.classList.add('eye-hidden');
    if (eyeToko) eyeToko.classList.add('eye-hidden');

    // Función para alternar la visibilidad de la contraseña
    const togglePasswordVisibility = (input, eyeContainer) => {
        if (!input || !eyeContainer) return;
        
        // Hacemos que el contenedor parezca clickeable y no seleccionable
        eyeContainer.style.cursor = 'pointer';
        eyeContainer.style.userSelect = 'none';

        eyeContainer.addEventListener('click', () => {
            const icon = eyeContainer.querySelector('i');
            if (!icon) return;

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    };

    // Configurar el evento de click para los campos de contraseña
    togglePasswordVisibility(inputTiki, eyeTiki);
    togglePasswordVisibility(inputToko, eyeToko);

    // Función para validar todos los campos y habilitar/deshabilitar el botón
    const validateFields = () => {
        const allFilled = inputs.every(input => input && input.value.trim().length > 0);
        
        if (allFilled) {
            if (btnIngresar) {
                btnIngresar.removeAttribute('disabled');
                btnIngresar.classList.remove('mat-button-disabled');
                btnIngresar.classList.add('btn-custom-enabled');
            }
        } else {
            if (btnIngresar) {
                btnIngresar.setAttribute('disabled', 'true');
                btnIngresar.classList.add('mat-button-disabled');
                btnIngresar.classList.remove('btn-custom-enabled');
            }
        }
    };

    // Lógica para el Checkbox "Recordar mi documento"
    const checkboxInput = document.querySelector('input.mat-checkbox-input');
    if (checkboxInput) {
        checkboxInput.addEventListener('change', (e) => {
            const matCheckbox = checkboxInput.closest('mat-checkbox');
            if (matCheckbox) {
                if (e.target.checked) {
                    matCheckbox.classList.add('mat-checkbox-checked');
                } else {
                    matCheckbox.classList.remove('mat-checkbox-checked');
                }
            }
        });
    }

    // Añadir eventos a cada input
    inputs.forEach(input => {
        if (!input) return;

        const container = getFieldContainer(input);

        // Evento Focus (al hacer clic en el input)
        input.addEventListener('focus', () => {
            if (container) container.classList.add('custom-focused');
        });

        // Evento Blur (al salir del input)
        input.addEventListener('blur', () => {
            if (container) container.classList.remove('custom-focused');
        });

        // Evento Input (al escribir texto)
        input.addEventListener('input', () => {
            // Si es doko, eliminar cualquier caracter que no sea número
            if (input === inputDoko) {
                input.value = input.value.replace(/\D/g, '');
            }

            const hasValue = input.value.length > 0;
            
            // Mantener label arriba si hay texto
            if (container) {
                if (hasValue) {
                    container.classList.add('custom-has-value');
                } else {
                    container.classList.remove('custom-has-value');
                }
            }

            // Mostrar u ocultar ojo para tiki y toko
            if (input === inputTiki && eyeTiki) {
                if (hasValue) eyeTiki.classList.remove('eye-hidden');
                else eyeTiki.classList.add('eye-hidden');
            }

            if (input === inputToko && eyeToko) {
                if (hasValue) eyeToko.classList.remove('eye-hidden');
                else eyeToko.classList.add('eye-hidden');
            }

            // Validar si el botón debe habilitarse
            validateFields();
        });
    });

    // Lógica para alternar pestañas "Soy cliente" y "Quiero ser cliente"
    const tabButtons = document.querySelectorAll('button.btn_acccesibility');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover 'active' de todos los botones de pestaña
            tabButtons.forEach(b => b.classList.remove('active'));
            // Agregar 'active' solo al botón clicado
            btn.classList.add('active');
        });
    });
});
