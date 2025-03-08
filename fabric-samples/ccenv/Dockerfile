#
# Copyright contributors to the Hyperledger Fabric project
#
# SPDX-License-Identifier: Apache-2.0
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at:
#
# 	  http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

FROM ubuntu:20.04

ARG TARGETARCH=amd64
ARG TARGETOS=linux
ARG GO_VER=1.20.3
ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt install -y \
    binutils-gold \
    curl \
    g++ \
    gcc \
    git \
    ca-certificates \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sL https://go.dev/dl/go${GO_VER}.${TARGETOS}-${TARGETARCH}.tar.gz | tar zxvf - -C /usr/local
ENV PATH="/usr/local/go/bin:$PATH"

RUN     groupadd --gid 500 chaincode
RUN     useradd -c "" -u 500 -g 500 -d /home/chaincode -m chaincode

RUN mkdir    -p /chaincode/output /chaincode/input
RUN chown    -R chaincode:chaincode /chaincode

CMD ["peer", "chaincode", "start"]

USER chaincode
