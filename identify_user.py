import csv

clients_data = [
    {"external_id": "client_01", "email": "client01@example.com", "phone": "000-000-0001", "timezone": "America/New_York", "locale": "en", "first_name": "John", "last_name": "Doe", "has_completed_onboarding": True},
    {"external_id": "client_02", "email": "client02@example.com", "phone": "000-000-0002", "timezone": "America/Los_Angeles", "locale": "en", "first_name": "Jane", "last_name": "Smith", "has_completed_onboarding": False},
    {"external_id": "client_03", "email": "client03@example.com", "phone": "000-000-0003", "timezone": "America/Chicago", "locale": "en", "first_name": "Mike", "last_name": "Johnson", "has_completed_onboarding": True},
    {"external_id": "client_04", "email": "client04@example.com", "phone": "000-000-0004", "timezone": "America/Denver", "locale": "en", "first_name": "Emily", "last_name": "Williams", "has_completed_onboarding": False},
    {"external_id": "client_05", "email": "client05@example.com", "phone": "000-000-0005", "timezone": "America/Phoenix", "locale": "en", "first_name": "David", "last_name": "Jones", "has_completed_onboarding": True},
    {"external_id": "client_06", "email": "client06@example.com", "phone": "000-000-0006", "timezone": "America/Indianapolis", "locale": "en", "first_name": "Amy", "last_name": "Brown", "has_completed_onboarding": False},
    {"external_id": "client_07", "email": "client07@example.com", "phone": "000-000-0007", "timezone": "America/Honolulu", "locale": "en", "first_name": "Robert", "last_name": "Davis", "has_completed_onboarding": True},
    {"external_id": "client_08", "email": "client08@example.com", "phone": "000-000-0008", "timezone": "America/Anchorage", "locale": "en", "first_name": "Laura", "last_name": "Miller", "has_completed_onboarding": False},
    {"external_id": "client_09", "email": "client09@example.com", "phone": "000-000-0009", "timezone": "America/New_York", "locale": "en", "first_name": "James", "last_name": "Wilson", "has_completed_onboarding": True},
    {"external_id": "client_10", "email": "client10@example.com", "phone": "000-000-0010", "timezone": "America/Los_Angeles", "locale": "en", "first_name": "Sarah", "last_name": "Moore", "has_completed_onboarding": False},
]

with open('clients_data.csv', mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=clients_data[0].keys())
    writer.writeheader()
    for client in clients_data:
        writer.writerow(client)

print("CSV file 'clients_data.csv' created successfully.")