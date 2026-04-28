# Infrastructure & DevOps Documentation

Repositorio centralizado de documentación de infraestructura, DevOps y ciberseguridad para todos los proyectos.

## Estructura

```
projects/
├── <nombre-proyecto>/
│   ├── <entorno>/                  # test, demo, prod, staging...
│   │   ├── server-info/            # Información del servidor (OS, hardware, red)
│   │   ├── web-stack/              # Stack web (Apache/Nginx, PHP, CMS, etc.)
│   │   ├── devops/                 # CI/CD, deploys, scripts, configuraciones
│   │   ├── cybersecurity/          # Auditorías, vulnerabilidades, compliance
│   │   └── database/              # Motor, configuración, esquemas
│   └── README.md                   # Descripción general del proyecto
└── README.md                       # Índice de proyectos
```

## Principios Fundamentales

1. **Solo lectura** - NUNCA se modifican los servidores. Toda interacción es de lectura/consulta.
2. **Sin credenciales** - NUNCA se almacenan contraseñas, tokens o secrets en el repositorio. Se solicitan en tiempo de ejecución.
3. **Documentación viva** - Los informes se actualizan periódicamente con datos reales de los servidores.

## Convenciones

- Nombres de carpetas en `kebab-case`
- Documentación en Markdown
- Fechas en formato ISO 8601 (YYYY-MM-DD)
- Un archivo por dominio/tema
