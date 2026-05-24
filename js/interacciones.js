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
});
