<!-- src/components/base/Component-LoginForm.vue -->

<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">{{ title }}</h1>
      <h2 class="login-subtitle">{{ subtitle }}</h2>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <input
            type="email"
            v-model="formData.email"
            placeholder="Correo Electrónico"
            @blur="errors.email = validateLocalEmail(formData.email)"
            :class="{ error: errors.email }"
            :disabled="loading"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>
        <div class="form-group">
          <input
            type="password"
            v-model="formData.password"
            placeholder="Contraseña"
            @blur="errors.password = validateLocalPassword(formData.password)"
            :class="{ error: errors.password }"
            :disabled="loading"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div v-if="globalErrorMessage" class="global-error-message">
          {{ globalErrorMessage }}
        </div>

        <button type="submit" class="login-button" :disabled="loading || hasErrors">
          <span>{{ loading ? 'Ingresando...' : 'Ingresar' }}</span>
        </button>
      </form>
      <div class="logo">
        <h1 class="title">Eha<span>Soft</span></h1>
        <p class="subtitle"><span>SOFTWARE</span> DEVELOPMENT</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'

const props = defineProps({
  title: String,
  subtitle: String,
  loginHandler: { type: Function, required: true },
  globalErrorMessage: String,
})

const formData = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const loading = ref(false)

const validateLocalEmail = (email) => {
  if (!email) return 'El email es requerido.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Formato de email inválido.'
  return ''
}

const validateLocalPassword = (password) => {
  if (!password) return 'La contraseña es requerida.'
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  return ''
}

const hasErrors = computed(() => !!errors.email || !!errors.password)

const handleSubmit = async () => {
  // Corremos validaciones locales una última vez
  errors.email = validateLocalEmail(formData.email)
  errors.password = validateLocalPassword(formData.password)

  if (hasErrors.value) return

  loading.value = true
  // Llamamos al handler del padre, que es el que habla con el store
  await props.loginHandler({ email: formData.email, password: formData.password })
  loading.value = false
}
</script>

<style lang="scss" scoped>
:root {
  --primary-color: #2196f3;
  --primary-hover-color: #73b7ee;
  --disabled-color: #90caf9;
  --error-color: #ff5252;
  --error-bg-color: #ffebee;
  --text-color: #333;
  --subtitle-color: #666;
  --input-border-color: #ddd;
  --input-focus-color: rgba(33, 150, 243, 0.1);
  --input-error-focus-color: rgba(255, 82, 82, 0.1);
  --background-color: #dfd5d5;
}
.reset-password-button {
  color: var(--primary-color);
  font-size: 0.75rem;
  align-self: flex-end;
  margin-top: -1.1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;

  &:hover {
    color: var(--primary-hover-color);
  }
}
.login-container {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
  padding: 1rem;
  width: 50%;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-title {
  color: var(--text-color);
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.login-subtitle {
  color: var(--subtitle-color);
  font-size: 1rem;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  position: relative;

  input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid var(--input-border-color);
    border-radius: 4px;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px var(--input-focus-color);
    }

    &.error {
      border-color: var(--error-color);

      &:focus {
        box-shadow: 0 0 0 2px var(--input-error-focus-color);
      }
    }

    &:disabled {
      background-color: var(--background-color);
      cursor: not-allowed;
    }
  }
}

.error-message {
  color: var(--error-color);
  font-size: 0.8rem;
  position: absolute;
  left: 0;
  bottom: -20px;
}

.login-button {
  background-color: var(--primary-color); /* Fondo sólido inicial */
  color: white; /* Color del texto */
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition:
    background 0.3s ease,
    transform 0.3s ease,
    box-shadow 0.3s ease,
    color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background-color: var(--primary-hover-color); /* Color de hover */
    transform: scale(1.03); /* Aumento del tamaño */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* Sombra más pronunciada */
    color: #ffffff; /* Asegura que el texto sea visible */
  }

  &:disabled {
    background-color: var(--disabled-color);
    cursor: not-allowed;
  }
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.alert-error {
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: var(--error-bg-color);
  color: var(--error-color);
  font-size: 0.9rem;
  border-radius: 4px;
  text-align: left;
}

.login-footer {
  margin-top: 2rem;
  color: var(--subtitle-color);
  font-size: 0.9rem;
}

.logo {
  margin-top: 10px;
}
// .logo:hover {
// 	cursor: pointer;
// 	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
// }
.title {
  font-size: 1.5em;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 1px;
  text-shadow:
    -2px -2px 2px rgba(0, 0, 0, 0.3),
    2px 2px 2px rgba(0, 0, 0, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.5);
}

.title span,
.subtitle span {
  color: #2196f3; /* Light blue for "Soft" part */
}

.subtitle {
  margin-top: -5px !important;
  font-size: 0.8em;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 2px;
  margin-top: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
}

@media screen and (max-width: 480px) {
  .login-box {
    padding: 1.5rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .login-subtitle {
    font-size: 0.9rem;
  }

  .form-group input {
    padding: 0.7rem;
  }
  .login-container {
    // background-color: var(--disabled-color);
    width: 100% !important;
  }
}

@media screen and (min-width: 481px) and (max-width: 768px) {
  .login-container {
    width: 90% !important;
  }
}
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .login-container {
    width: 70% !important;
  }
}
</style>
