import shutil
from pathlib import Path
import sys

def copy_rest_framework_static():
    # Buscar la ubicación de rest_framework instalado
    try:
        import rest_framework
        rf_path = Path(rest_framework.__file__).parent / 'static' / 'rest_framework'
        
        if not rf_path.exists():
            print(f"❌ No se encontró REST Framework static en: {rf_path}")
            sys.exit(1)
        
        # Destino en static_src
        dest = Path(__file__).parent / 'static_src' / 'rest_framework'
        
        # Limpiar destino si existe
        if dest.exists():
            shutil.rmtree(dest)
        
        # Crear directorio padre
        dest.parent.mkdir(parents=True, exist_ok=True)
        
        # Copiar archivos
        shutil.copytree(rf_path, dest)
        print(f"✅ Archivos copiados desde: {rf_path}")
        print(f"✅ Archivos copiados a: {dest}")
        
        # Verificar contenido
        css_files = list((dest / 'css').glob('*.css')) if (dest / 'css').exists() else []
        js_files = list((dest / 'js').glob('*.js')) if (dest / 'js').exists() else []
        
        print(f"✅ Archivos CSS: {len(css_files)}")
        print(f"✅ Archivos JS: {len(js_files)}")
        
    except ImportError:
        print("❌ REST Framework no está instalado")
        sys.exit(1)

if __name__ == '__main__':
    copy_rest_framework_static()