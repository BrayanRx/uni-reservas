import pandas as pd
from sqlalchemy import create_engine

# Conexión apuntando al puerto 5433 que acabas de configurar
DATABASE_URL = "postgresql://user:password@127.0.0.1:5433/reservas_db"
engine = create_engine(DATABASE_URL)

def main():
    print("\n" + "="*60)
    print("📦 AUDITORÍA DE BASE DE DATOS: RESERVAS UNI")
    print("="*60)

    # Lista de tablas estructurales a consultar
    tables = ["faculties", "rooms", "class_schedules", "users", "reservations"]
    
    for table in tables:
        try:
            # Consultar toda la tabla
            df = pd.read_sql(f"SELECT * FROM {table}", engine)
            
            print(f"\n--- TABLA: {table.upper()} | Total Registros: {len(df)} ---")
            
            if df.empty:
                print(" > (Tabla vacía)")
            else:
                # Mostrar los primeros 15 registros formateados
                print(df.head(15).to_string(index=False))
                if len(df) > 15:
                    print(f" ... (+ {len(df) - 15} filas omitidas)")
                    
        except Exception as e:
            print(f" [X] Error al leer la tabla {table}: {e}")

if __name__ == "__main__":
    # Configurar Pandas para no truncar columnas en la consola
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', 1000)
    main()