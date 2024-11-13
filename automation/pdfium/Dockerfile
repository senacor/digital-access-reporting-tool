# Use an official Ubuntu base image with Docker already installed
FROM ubuntu:noble

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# see: https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md#docker
RUN apt update && \
  apt install software-properties-common -y && \
  add-apt-repository ppa:git-core/ppa && \
  apt update && \
  apt install -y --no-install-recommends \
    curl \
    git \
    lsb-release \
    file \
    sudo \
    python3 && \
  rm -rf /var/lib/apt/lists/* && \
  git clone --depth 1 https://chromium.googlesource.com/chromium/tools/depot_tools.git /opt/chromium/depot_tools

# Export depot_tools path
ENV PATH="/opt/chromium/depot_tools:${PATH}"

# Configure git for safe.directory
RUN git config --global --add safe.directory /opt/chromium/depot_tools && \
    git config --global --add safe.directory /opt/chromium/build && \
    mkdir /opt/chromium/build && \
    cd /opt/chromium/build && \
    gclient config --unmanaged https://pdfium.googlesource.com/pdfium.git && \
    gclient sync && \
    cd pdfium && \
    ./build/install-build-deps.sh && \
    gn gen out/Default && \
    ninja -C out/Default pdfium_all

