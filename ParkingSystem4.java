import java.util.Scanner;
import java.util.regex.Pattern;
import java.time.LocalDateTime;
import java.time.Duration;

class Vehicle {
    private String licensePlate;
    private String type;

    public Vehicle(String licensePlate, String type) {
        this.licensePlate = licensePlate;
        this.type = type;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public String getType() {
        return type;
    }

    public void displayInfo() {
        System.out.println("Vehicle Type: " + type + ", License Plate: " + licensePlate);
    }
}


class Car extends Vehicle {
    public Car(String licensePlate) {
        super(licensePlate, "Car");
    }
}


class Bike extends Vehicle {
    public Bike(String licensePlate) {
        super(licensePlate, "Bike");
    }
}


class ParkingSlot {
    private int slotNumber;
    private boolean isOccupied;
    private Vehicle parkedVehicle;
    private LocalDateTime entryTime;
    private static final int HOURLY_RATE = 50;

    public ParkingSlot(int slotNumber) {
        this.slotNumber = slotNumber;
        this.isOccupied = false;
    }

    public boolean isOccupied() {
        return isOccupied;
    }

    public Vehicle getParkedVehicle() {
        return parkedVehicle;
    }

    public boolean parkVehicle(Vehicle vehicle) {
        if (!isOccupied) {
            this.parkedVehicle = vehicle;
            this.entryTime = LocalDateTime.now();
            this.isOccupied = true;
            System.out.println(" Vehicle parked in slot " + slotNumber);
            return true;
        } else {
            System.out.println(" Slot " + slotNumber + " is already occupied.");
            return false;
        }
    }

    public void removeVehicle() {
        if (isOccupied) {
            LocalDateTime exitTime = LocalDateTime.now();
            long hoursParked = Duration.between(entryTime, exitTime).toHours();
            hoursParked = (hoursParked == 0) ? 1 : hoursParked; 
            int amountDue = (int) hoursParked * HOURLY_RATE;

            System.out.println(" Vehicle removed from slot " + slotNumber);
            System.out.println(" Duration parked: " + hoursParked + " hour(s)");
            System.out.println(" Amount due: Rs." + amountDue);


            parkedVehicle = null;
            isOccupied = false;
            entryTime = null;
        } else {
            System.out.println(" Slot " + slotNumber + " is already empty.");
        }
    }

    public void displaySlotInfo() {
        System.out.print("Slot " + slotNumber + ": ");
        if (isOccupied) {
            parkedVehicle.displayInfo();
        } else {
            System.out.println("Empty");
        }
    }

    public int getSlotNumber() {
        return slotNumber;
    }
}



public class ParkingSystem4 {
    public static void main(String[] args) {
        ParkingSlot[] slots = new ParkingSlot[8];
        for (int i = 0; i < slots.length; i++) {
            slots[i] = new ParkingSlot(i + 1);
        }

        Scanner scanner = new Scanner(System.in);
        Pattern licensePattern = Pattern.compile("^[A-Z]{2}\\d{2}[A-Z]{2}\\d{4}$"); // Example: TN01AB1234

        System.out.println(" Welcome to the Parking System ");

        while (true) {
            System.out.println("\nChoose an option:");
            System.out.println("1. Park a vehicle");
            System.out.println("2. Check where a vehicle is parked");
            System.out.println("3. View parking status");
            System.out.println("4. Remove a vehicle and pay");
            System.out.println("5. Exit");
            System.out.print("Enter your choice: ");
            String choice = scanner.nextLine();

            switch (choice) {
                case "1":
                    System.out.println("Choose vehicle type:");
                    System.out.println("1. Car");
                    System.out.println("2. Bike");
                    System.out.print("Enter your choice: ");
                    String vehicleTypeChoice = scanner.nextLine();

                    System.out.print("Enter vehicle license plate: ");
                    String plate = scanner.nextLine().toUpperCase();

                    if (!licensePattern.matcher(plate).matches()) {
                        System.out.println(" Invalid license plate format.");
                        break;
                    }

                    Vehicle vehicle;
                    if (vehicleTypeChoice.equals("1")) {
                        vehicle = new Car(plate);
                    } else if (vehicleTypeChoice.equals("2")) {
                        vehicle = new Bike(plate);
                    } else {
                        System.out.println(" Invalid vehicle type choice.");
                        break;
                    }

                    boolean parked = false;
                    for (ParkingSlot slot : slots) {
                        if (!slot.isOccupied()) {
                            slot.parkVehicle(vehicle);
                            parked = true;
                            break;
                        }
                    }

                    if (!parked) {
                        System.out.println(" Parking is full.");
                    }
                    break;

                case "2":
                    System.out.print("Enter license plate to search: ");
                    String searchPlate = scanner.nextLine().toUpperCase();
                    boolean found = false;

                    for (ParkingSlot slot : slots) {
                        if (slot.isOccupied() && slot.getParkedVehicle().getLicensePlate().equals(searchPlate)) {
                            System.out.println(" Vehicle " + searchPlate + " is parked in slot " + slot.getSlotNumber());
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        System.out.println("Vehicle not found in any slot.");
                    }
                    break;

                case "3":
                    System.out.println(" Parking Status:");
                    for (ParkingSlot slot : slots) {
                        slot.displaySlotInfo();
                    }
                    break;

                case "4":
                    System.out.print("Enter license plate to remove: ");
                    String removePlate = scanner.nextLine().toUpperCase();
                    boolean removed = false;

                    for (ParkingSlot slot : slots) {
                        if (slot.isOccupied() && slot.getParkedVehicle().getLicensePlate().equals(removePlate)) {
                            slot.removeVehicle();
                            removed = true;
                            break;
                        }
                    }

                    if (!removed) {
                        System.out.println("Vehicle not found in any slot.");
                    }
                    break;

                case "5":
                    System.out.println(" Exiting the system.");
                    scanner.close();
                    return;

                default:
                    System.out.println(" Invalid choice. Please try again.");
            }
        }
    }
}