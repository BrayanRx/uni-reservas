import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.models import Faculty, Room, ClassSchedule

# 1. Configuración de conexión orientada al host local
# Sobrescribimos el host 'db' por 'localhost' para acceder al contenedor desde fuera
DATABASE_URL = "postgresql://user:password@127.0.0.1:5433/reservas_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def main():
    db = SessionLocal()
    try:
        print("[>] Iniciando proceso de ingesta de datos...")
        
        # Leer el archivo Excel
        df = pd.read_excel("horarios.xlsx")
        
        # Limpiar nombres de columnas por seguridad (eliminar espacios invisibles)
        df.columns = df.columns.astype(str).str.strip()

        # 2. Gestionar la Facultad
        faculty_name = "FIIS"
        faculty = db.query(Faculty).filter(Faculty.name == faculty_name).first()
        
        if not faculty:
            faculty = Faculty(name=faculty_name, is_active=True)
            db.add(faculty)
            db.commit()
            db.refresh(faculty)
            print(f"[+] Facultad '{faculty_name}' creada (ID: {faculty.id})")
        else:
            print(f"[✓] Facultad '{faculty_name}' detectada (ID: {faculty.id})")

        # 3. Gestionar Aulas Físicas (Distinct)
        unique_rooms = df['AULA'].dropna().unique()
        room_map = {}
        new_rooms_count = 0

        for room_name in unique_rooms:
            room_name = str(room_name).strip()
            # Buscar si el aula ya existe para esta facultad
            room = db.query(Room).filter(
                Room.name == room_name, 
                Room.faculty_id == faculty.id
            ).first()
            
            if not room:
                room = Room(
                    name=room_name,
                    capacity=30,             # Valor temporal por defecto
                    location="Pabellón FIIS", # Valor temporal por defecto
                    type="Aula",             # Valor temporal por defecto
                    faculty_id=faculty.id,
                    is_active=True
                )
                db.add(room)
                db.commit()  # Commit inmediato para obtener el ID generado
                db.refresh(room)
                new_rooms_count += 1
            
            # Guardar el ID real de la base de datos en memoria para mapear los horarios
            room_map[room_name] = room.id

        print(f"[+] Análisis de aulas: {len(unique_rooms)} únicas encontradas ({new_rooms_count} nuevas insertadas).")

        # 4. Procesar y Mapear Horarios (ClassSchedule)
        new_schedules_count = 0
        
        for index, row in df.iterrows():
            room_name = str(row['AULA']).strip()
            day = str(row['DÍA']).strip().upper()
            start = int(row['HORA INICIO'])
            end = int(row['HORA FINAL'])

            room_id = room_map[room_name]

            # Validar existencia previa para evitar duplicidad de bloques
            existing_schedule = db.query(ClassSchedule).filter(
                ClassSchedule.room_id == room_id,
                ClassSchedule.day_of_week == day,
                ClassSchedule.start_time == start,
                ClassSchedule.end_time == end
            ).first()

            if not existing_schedule:
                schedule = ClassSchedule(
                    room_id=room_id,
                    day_of_week=day,
                    start_time=start,
                    end_time=end
                )
                db.add(schedule)
                new_schedules_count += 1

        # Commit en bloque para los horarios
        db.commit()
        print(f"[+] Inserción de horarios: {new_schedules_count} nuevos bloques registrados.")
        print("[✓] Operación completada con éxito.")

    except Exception as e:
        db.rollback()
        print(f"[X] Falla crítica durante la ingesta: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()