# Contribuyendo a JSON String to JSON Converter

¡Gracias por tu interés en contribuir! 🎉

## 🤝 Cómo Contribuir

### Reportar Bugs

Si encuentras un bug, por favor abre un issue con:
- Descripción clara del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots si es aplicable
- Información del navegador/SO

### Sugerir Mejoras

Las sugerencias son bienvenidas. Abre un issue con:
- Descripción detallada de la mejora
- Casos de uso
- Ejemplos si es posible

### Pull Requests

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Haz** tus cambios siguiendo las guías de estilo
4. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
5. **Push** a la rama (`git push origin feature/AmazingFeature`)
6. **Abre** un Pull Request

## 📝 Guías de Estilo

### JavaScript

- Usa ES6+ features
- Usa const/let en lugar de var
- Nomenclatura camelCase para variables y funciones
- Nomenclatura PascalCase para clases
- Documenta funciones complejas con JSDoc
- Mantén funciones pequeñas y con una única responsabilidad

```javascript
/**
 * Descripción de la función
 * @param {string} param - Descripción del parámetro
 * @returns {object} Descripción del retorno
 */
function exampleFunction(param) {
  // código
}
```

### CSS

- Usa variables CSS para colores y valores reutilizables
- Nomenclatura kebab-case para clases
- Mantén especificidad baja
- Comenta secciones principales

```css
/* ========================================
   SECTION NAME
   ======================================== */
.class-name {
  /* properties */
}
```

### HTML

- Usa HTML5 semántico
- Incluye atributos ARIA cuando sea necesario
- Mantén la estructura limpia e indentada
- Comenta secciones complejas

## 🧪 Testing

Antes de hacer un PR:
- Prueba en múltiples navegadores (Chrome, Firefox, Safari, Edge)
- Verifica responsive design
- Prueba con diferentes tipos de JSON (válidos e inválidos)
- Verifica que no hay errores en la consola

## 📦 Commits

Usa commits descriptivos:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan código)
- `refactor:` Refactorización de código
- `perf:` Mejoras de rendimiento
- `test:` Añadir o corregir tests
- `chore:` Mantenimiento

Ejemplos:
```
feat: Add JSON repair functionality
fix: Correct collapse/expand toggle behavior
docs: Update README with Docker instructions
```

## 🔒 Seguridad

Si encuentras una vulnerabilidad de seguridad, por favor NO abras un issue público.
En su lugar, envía un email a security@yourdomain.com

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la licencia MIT del proyecto.

## ❓ Preguntas

Si tienes preguntas, abre un issue con la etiqueta "question" o contacta directamente.

---

¡Gracias por contribuir! 🚀
