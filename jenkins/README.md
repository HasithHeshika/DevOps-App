# Jenkins Docker Setup

This directory contains the Docker Compose configuration for running Jenkins in a container.

## Quick Start

```bash
# Start Jenkins
cd jenkins
docker-compose up -d

# Get initial admin password
docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword

# View logs
docker-compose logs -f

# Stop Jenkins
docker-compose down

# Stop and remove volumes (CAUTION: Deletes all Jenkins data)
docker-compose down -v
```

## Access Jenkins

- **Web UI**: http://localhost:8080
- **Agent Port**: 50000

## Initial Setup

1. Get the initial admin password:
   ```bash
   docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
   ```

2. Open http://localhost:8080 in browser

3. Paste the password and follow setup wizard

4. Install suggested plugins

5. Create admin user

## Configuration

### Enable Docker in Jenkins

The Jenkins container is configured with:
- Docker socket mounted (`/var/run/docker.sock`)
- Docker binary mounted (`/usr/bin/docker`)
- Running as root user for Docker access

### Verify Docker Access

Inside Jenkins container:
```bash
docker exec jenkins-server docker --version
docker exec jenkins-server docker ps
```

## Troubleshooting

### Jenkins can't access Docker

If Jenkins shows "docker: command not found":

```bash
# Enter Jenkins container
docker exec -it jenkins-server bash

# Verify Docker is accessible
docker --version

# Check permissions
ls -la /var/run/docker.sock
```

### Permission denied for Docker socket

```bash
# Fix permissions (run on host)
sudo chmod 666 /var/run/docker.sock

# Or add jenkins user to docker group (in container)
docker exec -u root jenkins-server usermod -aG docker jenkins
docker restart jenkins-server
```

### Reset Jenkins

```bash
# Stop and remove everything
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Backup Jenkins Data

```bash
# Backup Jenkins home directory
docker run --rm \
  -v jenkins_jenkins_home:/source:ro \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/jenkins-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /source .

# Restore Jenkins data
docker run --rm \
  -v jenkins_jenkins_home:/target \
  -v $(pwd)/backup:/backup \
  alpine tar xzf /backup/jenkins-backup-YYYYMMDD-HHMMSS.tar.gz -C /target
```

## Environment Variables

You can customize Jenkins by editing `docker-compose.yml`:

- `JAVA_OPTS`: Java options for Jenkins JVM
- `JENKINS_OPTS`: Jenkins-specific options
- `JENKINS_URL`: Jenkins URL for agents

## Network Configuration

Jenkins runs in a custom network `jenkins-network`. This allows:
- Communication between Jenkins and agents
- Isolation from other Docker containers
- Custom DNS resolution

## Volumes

- `jenkins_home`: Persists Jenkins data (jobs, plugins, configurations)
- `/var/run/docker.sock`: Enables Docker-in-Docker
- `/usr/bin/docker`: Makes Docker CLI available

## Security Notes

- Jenkins runs as root for Docker access (not recommended for production)
- For production, use proper user permissions and security measures
- Consider using Jenkins Configuration as Code (JCasC)
- Enable authentication and authorization
- Use HTTPS with reverse proxy (Nginx/Traefik)

## Production Considerations

For production use:

1. **Use HTTPS**: Set up reverse proxy with SSL
2. **Backup regularly**: Implement automated backups
3. **Separate agents**: Use dedicated build agents
4. **Resource limits**: Add CPU/memory limits to docker-compose.yml
5. **Security hardening**: Follow Jenkins security best practices
6. **Monitoring**: Add monitoring and alerting
7. **High availability**: Consider Jenkins HA setup

## Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkins Docker Image](https://hub.docker.com/r/jenkins/jenkins)
- [Docker-in-Docker Guide](https://www.jenkins.io/doc/book/installing/docker/)
