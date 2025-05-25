FROM docker:24.0.7-cli

# basic tooling
RUN apk add --no-cache bash git openjdk17 maven curl

# kubectl
RUN curl -sLO https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl \
 && install -m0755 kubectl /usr/local/bin/ && rm kubectl

# trivy
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh \
  | sh -s -- -b /usr/local/bin
