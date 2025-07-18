#!/bin/bash

# Jetson Network Konfigürasyonu
# Internet Gateway + AP Setup

echo "🌐 Network Konfigürasyonu Başlıyor..."

# Network interface'leri kontrol et
echo "📡 Network interface'leri:"
ip addr show

# Internet bağlantısı olan interface'i bul (genelde eth0 veya wlan0)
read -p "Internet bağlantısı olan interface adını girin (örn: eth0): " WAN_INTERFACE
read -p "AP olacak interface adını girin (örn: wlan0): " LAN_INTERFACE

# IP forwarding aktif et
echo "🔄 IP forwarding aktif ediliyor..."
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# iptables kuralları
echo "🛡️ iptables kuralları ayarlanıyor..."
sudo iptables -t nat -A POSTROUTING -o $WAN_INTERFACE -j MASQUERADE
sudo iptables -A FORWARD -i $LAN_INTERFACE -o $WAN_INTERFACE -j ACCEPT
sudo iptables -A FORWARD -i $WAN_INTERFACE -o $LAN_INTERFACE -m state --state RELATED,ESTABLISHED -j ACCEPT

# iptables kurallarını kaydet
sudo iptables-save | sudo tee /etc/iptables/rules.v4

# DHCP Server konfigürasyonu
echo "📡 DHCP Server konfigürasyonu..."
sudo tee /etc/dnsmasq.conf > /dev/null <<EOF
interface=$LAN_INTERFACE
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
dhcp-option=3,192.168.4.1
dhcp-option=6,192.168.4.1
server=8.8.8.8
server=8.8.4.4
log-queries
log-dhcp
EOF

# LAN interface'ini statik IP ile yapılandır
echo "🔧 LAN interface yapılandırılıyor..."
sudo tee /etc/netplan/01-netcfg.yaml > /dev/null <<EOF
network:
  version: 2
  renderer: networkd
  ethernets:
    $LAN_INTERFACE:
      dhcp4: no
      addresses:
        - 192.168.4.1/24
      nameservers:
          addresses: [8.8.8.8, 8.8.4.4]
EOF

sudo netplan apply

echo "✅ Network konfigürasyonu tamamlandı!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. TP-Link CPE510'u AP moduna al"
echo "2. CPE510'u 192.168.4.1'e bağla"
echo "3. Captive portal servisini başlat" 