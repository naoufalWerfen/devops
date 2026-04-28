# Server Overview - Distributors Portal TEST

**Servidor:** 10.120.204.25  
**Hostname:** DISTRIBUTORSPORTALTEST  
**Última actualización:** 2026-04-27

## Sistema Operativo

| Propiedad | Valor |
|-----------|-------|
| **SO** | SUSE Linux Enterprise Server 15 SP6 (SLES 15-SP6) |
| **Kernel** | Linux 6.4.0-150600.23.25-default x86_64 |
| **Hostname** | DISTRIBUTORSPORTALTEST |
| **IP** | 10.120.204.25 |
| **Uptime** | 535 días (a fecha 2026-04-27) |
| **Virtualización** | VMware (máquina virtual) |

## Hardware (Virtual)

| Recurso | Detalle |
|---------|---------|
| **CPU** | Intel Xeon Gold 5220R @ 2.20GHz (1 vCPU) |
| **RAM Total** | 31 GiB |
| **RAM Usada** | 1.8 GiB |
| **RAM Disponible** | 29 GiB |
| **Swap** | 1.2 GiB (0B usado) |
| **Disco principal** | /dev/sda2 - 38 GB total, 19 GB usado (53%), 17 GB libre |
| **Partición EFI** | /dev/sda1 - 500 MB |

## Servicios Activos

| Servicio | Estado | Puerto |
|----------|--------|--------|
| SSH (sshd) | ACTIVO | 22 |
| Apache (httpd) | ACTIVO | 80 |
| MariaDB (mysqld) | ACTIVO | 3306 (localhost) |
| Postfix (master) | ACTIVO | 25 (localhost) |
| SNMP (snmpd) | ACTIVO | 199 (localhost) |
| agentid-service | ACTIVO | 10001 |

## Red

- **Puertos expuestos externamente:** 22 (SSH), 80 (HTTP)
- **Sin HTTPS directo:** SSL se termina en reverse proxy externo (212.163.185.1)
- **MariaDB solo accesible localmente** (bind 127.0.0.1)
